using BHIRDV3.BLL.ViewModel;
using System.Linq;
using Dapper;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Update;
using BHIRDV3.DAL;
using Microsoft.Data.SqlClient;
using System.Xml.Linq;
using System;
using System.Data.Common;

namespace BHIRDV3.BLL.Managers
{
    public class BenefitsManager : ManagerBase
    {
        public List<BenefitSetPlanListViewModel> GetBenefitSetsPlanList(int planPeriodId, List<int> carrierIds)
        {
            List<BenefitSetPlanListViewModel> plans = new List<BenefitSetPlanListViewModel>();

            foreach (int x in carrierIds)
            {
                var p = _db.Database.GetDbConnection().Query<BenefitSetPlanListViewModel>("EXEC up_Benefits_GetBenefitSetsPlanList @PlanPeriodId,@CarrierId", new { PlanPeriodId = planPeriodId, CarrierId = x }).ToList();
                plans.AddRange(p);
            }

            return plans;

        }

        public List<BenefitPlanListViewModel> GetBenefitPlanList(int planPeriodId, List<int> carrierIds)
        {
            List<BenefitPlanListViewModel> plans = new List<BenefitPlanListViewModel>();

            foreach (int x in carrierIds)
            {
                var p = _db.Database.GetDbConnection().Query<BenefitPlanListViewModel>("EXEC up_Benefits_GetPlanList @PlanPeriodId,@CarrierId", new { PlanPeriodId = planPeriodId, CarrierId = x }).ToList();
                plans.AddRange(p);
            }

            return plans;

        }

        public List<BenefitDetailViewModel> GetBenefitDetails(int planPeriodId, int benefitSetId, List<int> carrierIds, string userRoleName)
        {
            List<BenefitDetailViewModel> bdvms = new List<BenefitDetailViewModel>();

            foreach (int carrierId in carrierIds)
            {
                var results = _db.Database.GetDbConnection().Query<BenefitDetailViewModel>("EXEC up_Benefits_GetDetails @PlanPeriodId, @BenefitSetId, @CarrierId, @UserRoleName", new { planPeriodId, benefitSetId, carrierId, userRoleName }).ToList();
                bdvms.AddRange(results);
            }

            foreach (var item in bdvms)
            {
                item.BenefitChangeReason = new DAL.PlanDesignChangeReason()
                {
                    ChangeReason = item.ChangeReason,
                    PlanDesignChangeReasonId = item.PlanDesignChangeReasonId
                };

                item.Ticks = item.LastUpdated.Ticks;
            }
            return bdvms;
        }

        public List<BenefitDetailHistoryViewModel> BenefitDetailHistory(int planDesignId, int rateSetId)
        {
            var results = _db.Database.GetDbConnection().Query<BenefitDetailHistoryViewModel>("EXEC up_Benefits_GetDetailHistory @PlanDesignId, @RateSetId", new { planDesignId, rateSetId }).ToList();
            return results;
        }

        public void Update(IEnumerable<BenefitDetailViewModel> benefitForm, string userName, bool isCarrier, int planPeriodId)
        {
            int benefitStatusId = 0;
            Dictionary<int, int> carriers = new Dictionary<int, int>();
            int carrierId = 0;
            var dashboard = new DashboardManager();

            using (var dbTransaction = _db.Database.BeginTransaction())
            {
                try
                {
                    foreach (BenefitDetailViewModel bf in benefitForm)
                    {
                        benefitStatusId = isCarrier ? 2 : 3;  //2 = Carrier Proposed, 3 = Boeing Proposed
                        bf.LastUpdated = DateTime.Now;
                        bf.UpdatedBy = userName;

                        //get the current value so we can see if it is open
                        var pdv = _db.PlanDesignValue.Where(x => x.PlanDesignValueId == bf.PlanDesignValueId).OrderByDescending(x => x.LastUpdated).FirstOrDefault();
                      
                        if(pdv.LastUpdated.Ticks != bf.Ticks)
                        {
                            bf.PlanDesignStatusId = -1;
                            continue;
                        }

                        if((bool)pdv.IsOpen && pdv.PlanDesignStatusId != benefitStatusId)
                        {
                            continue;
                        }

                        if (((isCarrier && pdv.PlanDesignStatusId == 2) || (!isCarrier && pdv.PlanDesignStatusId == 3)) && (bool)pdv.IsOpen)
                        {
                            pdv.IsOpen = false;
                            _db.SaveChanges();
                        }

                        //add new proposed 
                        if (!(bool)pdv.IsOpen)
                        {
                            var b = new PlanDesignValue();
                            b.RateSetId = bf.RateSetId == null ? 0 : bf.RateSetId;
                            b.PlanDesignId = bf.PlanDesignId;
                            b.Network = bf.Network ?? "";
                            b.OutOfNetwork = bf.OutOfNetwork ?? "";
                            b.LimitationsExceptions = bf.LimitationsExceptions ?? "";
                            b.PlanDesignChangeReasonId = bf.BenefitChangeReason.PlanDesignChangeReasonId;
                            b.PlanDesignStatusId = benefitStatusId;
                            b.Comments = bf.Comments ?? "";
                            b.LastUpdated = DateTime.Now;
                            b.UpdatedBy = userName;
                            b.IsOpen = true;
                            _db.PlanDesignValue.Add(b);
                            _db.SaveChanges();

                            bf.PlanDesignValueId = b.PlanDesignValueId;
                        }

                        carrierId = (from bs in _db.BenefitSet
                                     join pd in _db.PlanDesign on bs.BenefitSetId equals pd.BenefitSetId
                                     where pd.PlanDesignId == bf.PlanDesignId
                                     select bs).SingleOrDefault().CarrierId;

                        if (!carriers.ContainsKey(carrierId))
                        {
                            carriers.Add(carrierId, 1);
                        }
                        else
                        {
                            carriers[carrierId] = carriers[carrierId] + 1;
                        }

                    }
                                      
                    if (benefitForm.ToList().Count == 1)
                    {
                        dashboard.ActivityLogAdd(_db, 1, planPeriodId, carrierId, benefitForm.ToList()[0].DetailName, userName);
                    }
                    else
                    {
                        foreach (KeyValuePair<int, int> kvp in carriers)
                        {
                            dashboard.ActivityLogAdd(_db, 1, planPeriodId, kvp.Key, kvp.Value.ToString() + " Benefit Details changed", userName);
                        }
                    }

                    dbTransaction.Commit();
                }
                catch (Exception)
                {
                    dbTransaction.Rollback();
                    throw;
                }
            }

            _db.Dispose();
        }

        public List<RespondViewModel> PendingChanges(int planPeriodId, List<int> carrierIds, string userRoleName)
        {
            List<RespondViewModel> bfd = new List<RespondViewModel>();

            foreach (int x in carrierIds)
            {
                int carrierId = x;

                var p = _db.Database.GetDbConnection().Query<RespondViewModel>("EXEC up_Benefits_GetRespondToChanges @PlanPeriodId, @CarrierId, @UserRoleName", new { planPeriodId, carrierId, userRoleName }).ToList();

                bfd.AddRange(p);
            }

            foreach (BenefitDetailViewModel b in bfd)
            {
                b.BenefitChangeReason = new PlanDesignChangeReason()
                {
                    PlanDesignChangeReasonId = b.PlanDesignChangeReasonId,
                    ChangeReason = b.ChangeReason
                };
            }

            return bfd;
        }

        public void Reject(RespondViewModel benefitFormDetail, string userName, bool isCarrier, int planPeriodId)
        {
            int benefitStatusId = isCarrier == true ? 4 : 5;  //Carrier Rejected : Boeing Rejected

            //Fix up passed in values
            benefitFormDetail.Network = benefitFormDetail.Network ?? "";
            benefitFormDetail.OutOfNetwork = benefitFormDetail.OutOfNetwork ?? "";
            benefitFormDetail.LimitationsExceptions = benefitFormDetail.LimitationsExceptions ?? "";

            using (var dbTransaction = _db.Database.BeginTransaction())
            {
                try
                {
                    var planDesignValue = (from pdvs in _db.PlanDesignValue
                                           where pdvs.PlanDesignValueId == benefitFormDetail.PlanDesignValueId
                                           select pdvs).FirstOrDefault();
                   
                    //Close existing record
                    planDesignValue.IsOpen = false;

                    //Log new proposal as rejection
                    PlanDesignValue pdv = new PlanDesignValue();
                    pdv.PlanDesignId = benefitFormDetail.PlanDesignId;
                    pdv.PlanDesignStatusId = benefitStatusId;
                    pdv.PlanDesignChangeReasonId = benefitFormDetail.BenefitChangeReason.PlanDesignChangeReasonId;
                    pdv.Network = benefitFormDetail.Network;
                    pdv.OutOfNetwork = benefitFormDetail.OutOfNetwork;
                    pdv.LimitationsExceptions = benefitFormDetail.LimitationsExceptions;
                    pdv.Comments = benefitFormDetail.RespondComments;
                    pdv.RateSetId = benefitFormDetail.RateSetId == null ? 0 : benefitFormDetail.RateSetId;
                    pdv.LastUpdated = DateTime.Now;
                    pdv.UpdatedBy = userName;
                    pdv.IsOpen = true;
                    _db.PlanDesignValue.Add(pdv);
                    _db.SaveChanges();

                    var carrierId = (from bs in _db.BenefitSet
                                 join pd in _db.PlanDesign on bs.BenefitSetId equals pd.BenefitSetId
                                 where pd.PlanDesignId == benefitFormDetail.PlanDesignId
                                 select bs).SingleOrDefault().CarrierId;

                    new DashboardManager().ActivityLogAdd(_db, 3, planPeriodId, carrierId, benefitFormDetail.DetailName, userName);
                    dbTransaction.Commit();
                }
                catch (Exception)
                {
                    dbTransaction.Rollback();
                    throw;
                }
            }

            _db.Dispose();
        }

        // To avoid string concatenation in loops, we can use StringBuilder class to append strings.
        // We can also use string interpolation to concatenate strings.

        public void Approve(List<string> planDesignValueIds, string userName, int planPeriodId)
        {
            Dictionary<int, int> carriers = new Dictionary<int, int>();
            int carrierId = 0;
            var dashboard = new DashboardManager();

            using (var dbTransaction = _db.Database.BeginTransaction())
            {
                try
                {
                    foreach (string s in planDesignValueIds)
                    {
                        int planDesignValueId = Convert.ToInt32(s);

                        var planDesignValue = (from pdvs in _db.PlanDesignValue
                                               where pdvs.PlanDesignValueId == planDesignValueId
                                               select pdvs).FirstOrDefault();

                        planDesignValue.IsOpen = false;

                        PlanDesignValue pdv = new PlanDesignValue();
                        pdv.PlanDesignId = planDesignValue.PlanDesignId;
                        pdv.PlanDesignStatusId = 6;
                        pdv.PlanDesignChangeReasonId = planDesignValue.PlanDesignChangeReasonId;
                        pdv.Network = planDesignValue.Network;
                        pdv.OutOfNetwork = planDesignValue.OutOfNetwork;
                        pdv.LimitationsExceptions = planDesignValue.LimitationsExceptions;
                        pdv.RateSetId = planDesignValue.RateSetId == null ? 0 : planDesignValue.RateSetId;
                        pdv.LastUpdated = DateTime.Now;
                        pdv.UpdatedBy = userName;
                        pdv.IsOpen = false;
                        _db.PlanDesignValue.Add(pdv);
                        _db.SaveChanges();

                        carrierId = (from bs in _db.BenefitSet
                                     join pd in _db.PlanDesign on bs.BenefitSetId equals pd.BenefitSetId
                                     where pd.PlanDesignId == planDesignValue.PlanDesignId
                                     select bs).SingleOrDefault().CarrierId;

                        if (!carriers.ContainsKey(carrierId))
                        {
                            carriers.Add(carrierId, 1);
                        }
                        else
                        {
                            carriers[carrierId] = carriers[carrierId] + 1;
                        }

                    }

                    foreach (KeyValuePair<int, int> kvp in carriers)
                    {
                        string message = $"{kvp.Value} Benefit Details approved";
                        dashboard.ActivityLogAdd(_db, 2, planPeriodId, kvp.Key, message, userName);
                    }

                    dbTransaction.Commit();
                }
                catch (Exception)
                {
                    dbTransaction.Rollback();
                    throw;
                }
            }

            _db.Dispose();
        }

        public int CarrierBenefitSetName_Add(int planPeriodId, int carrierId, string benefitSetName)
        {
            CarrierBenefitSetName cbsn = new CarrierBenefitSetName();
            cbsn.CarrierId = carrierId;
            cbsn.BenefitSetName = benefitSetName;
            cbsn.StartDate = DateTime.Now;

            _db.CarrierBenefitSetName.Add(cbsn);
            _db.SaveChanges();

            BenefitSet bs = new BenefitSet();
            bs.CarrierId = carrierId;
            bs.CarrierBenefitSetNameId = cbsn.CarrierBenefitSetNameId;
            bs.BenefitSetTypeId = 9;
            bs.PlanPeriodId = planPeriodId;
            _db.BenefitSet.Add(bs);
            _db.SaveChanges();

            return cbsn.CarrierBenefitSetNameId;

        }
    
    }
}
