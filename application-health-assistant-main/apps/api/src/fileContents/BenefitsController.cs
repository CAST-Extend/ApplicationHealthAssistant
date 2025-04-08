using BHIRDV3.BLL.Managers;
using BHIRDV3.BLL.Utility;
using BHIRDV3.BLL.ViewModel;
using BHIRDV3.DAL;
using Kendo.Mvc.Extensions;
using Kendo.Mvc.UI;
using Mercer.HB.Boeing.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Web;

namespace BHIRDV3.Web.Controllers
{
    [Authorize(Roles = "BRES-Support,BRES-Boeing,BRES-Mercer-Negotiations,BRES-Mercer-PM,BRES-Carrier,BRES-Carrier-VIEW")]
    public class BenefitsController : ControllerBase
    {
        public IActionResult Index(string carrierName, string carrierDetailName, string pending)
        {
            RenewalViewModel renewal = new LookupManager().GetRenewalInformation(GetPlanPeriodId());
            ViewBag.IsReadOnly = IsReadOnly(renewal, "Benefits");
            carrierDetailName = HttpUtility.UrlDecode(carrierDetailName);

            //Filters
            ViewBag.CarrierFilter = carrierName != null && carrierName != "" ? carrierName : "";
            ViewBag.CarrierDetailNameFilter = carrierDetailName != null && carrierDetailName != "" ? carrierDetailName : "";
            ViewBag.Pending = pending != null && pending != "" ? pending : "";
            return View();
        }


        public IActionResult Detail(string id)
        {
            ViewData["PlanDesignChangeReasons"] = new LookupManager().GetChangeReasons(GetPlanPeriodId(), UserGroup());
            ViewData["defaultReason"] = new LookupManager().GetChangeReasons(GetPlanPeriodId(), UserGroup()).FirstOrDefault();
            RenewalViewModel renewal = new LookupManager().GetRenewalInformation(GetPlanPeriodId());
            List<int> carrierIds = GetCarrierIds();
            ViewBag.IsCarrier = !carrierIds.Contains(0) ? true : false;
            ViewBag.IsReadOnly = IsReadOnly(renewal, "Benefits");
            ViewBag.HideNav = true;
            var idList = id.Split(",");
            BenefitFormViewModel model = new BenefitFormViewModel();
            List<BenefitDetailViewModel> list = new List<BenefitDetailViewModel>();
            List<BenefitFormPlanSummary> summaries = new List<BenefitFormPlanSummary>();
            foreach (var benefitSetId in idList)
            {
                int bsid = Int32.Parse(benefitSetId);
                var result = new BenefitsManager().GetBenefitDetails(GetPlanPeriodId(), bsid, carrierIds, BenefitFormUserGroup());
                BenefitFormPlanSummary summary = new BenefitFormPlanSummary();
                summary.BenefitSetId = bsid;
                summary.DisplayName = result.FirstOrDefault().PlanDetailName;
                summaries.Add(summary);
                list.AddRange(result);
            }
            model.PlanSummaries = summaries;
            model.PlanDetails = list;
            model.BenefitSetIds = id;

            return View(model);
        }

        public JsonResult BenefitSetsPlanList_Read([DataSourceRequest] DataSourceRequest request)
        {
            var result = new BenefitsManager().GetBenefitSetsPlanList(GetPlanPeriodId(), GetCarrierIds());
            return Json(result.ToDataSourceResult(request));
        }

        public JsonResult BenefitPlanList_Read([DataSourceRequest] DataSourceRequest request)
        {
            var result = new BenefitsManager().GetBenefitPlanList(GetPlanPeriodId(), GetCarrierIds());
            return Json(result.ToDataSourceResult(request));
        }
        public ActionResult Respond_Read([DataSourceRequest] DataSourceRequest request)
        {
            return Json(new BenefitsManager().PendingChanges(GetPlanPeriodId(), GetCarrierIds(), BenefitFormUserGroup()).ToDataSourceResult(request));
        }

        //public JsonResult BenefitForm_Read([DataSourceRequest] DataSourceRequest request, int benefitSetId)
        //{
        //    var result = new BenefitsManager().GetBenefitDetails(GetPlanPeriodId(), benefitSetId, BenefitFormUserGroup());
        //    return Json(result.ToDataSourceResult(request));
        //}

        public ActionResult History(int PlanDesignId, int RateSetId)
        {
            List<BenefitDetailHistoryViewModel> bdhvm = new BenefitsManager().BenefitDetailHistory(PlanDesignId, RateSetId);

            //Carrier validation
            List<int> carrierIds = GetCarrierIds();
            bool validated = false;

            foreach (int i in carrierIds)
            {
                if (i == 0)
                {
                    validated = true;
                    break;
                }
                //need to add to validate this
                //else if (Carrier.IsAuthorizedForPlan(bdhvm.BenefitGroupId, i))
                //{
                //    validated = true;
                //    break;
                //}
            }

            if (!validated)
            {
                //need replacement for core for this
                //return new HttpUnauthorizedResult();
            }

            ViewBag.HideNav = true;

            return View(bdhvm);
        }
        [HttpGet]
        public ActionResult GetChangeReasons(string changeReasons)
        {
            List<PlanDesignChangeReason> allReasons = new LookupManager().GetChangeReasons(GetPlanPeriodId(), UserGroup()).ToList();
            if (!string.IsNullOrEmpty(changeReasons))
            {
                var filteredReasons = allReasons.Where(a => changeReasons.Split(',').Any(x => x.Trim().Equals(a.ChangeReason, StringComparison.OrdinalIgnoreCase))).ToList();
                if(changeReasons.Split(",").Any(x => x.Trim() == ""))
                {
                    filteredReasons.Add(new PlanDesignChangeReason { ChangeReason = null });
                }
                return Json(filteredReasons);
            }
            else
            {
                allReasons.Clear();
                allReasons.Add(new PlanDesignChangeReason { ChangeReason = null });
                return Json(allReasons);
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken()]
        public ActionResult BenefitForm_Update([DataSourceRequest] DataSourceRequest request, [Bind(Prefix = "models")] IEnumerable<BenefitDetailViewModel> benefitForm)
        {
            //validate
            var allReasons = new LookupManager().GetChangeReasons(GetPlanPeriodId(), UserGroup());
            var updateStatus = new StringBuilder();
            var stringBuilder = new StringBuilder();
            foreach (BenefitDetailViewModel bfdvm in benefitForm)
            {
                if (!string.IsNullOrEmpty(bfdvm.BenefitChangeReason.ChangeReason))
                {
                    var planDesignChangeReason = allReasons.FirstOrDefault(x => x.ChangeReason == bfdvm.BenefitChangeReason.ChangeReason.Trim());
                    bfdvm.BenefitChangeReason.PlanDesignChangeReasonId = planDesignChangeReason?.PlanDesignChangeReasonId ?? 0;
                }

                if (bfdvm.BenefitChangeReason.PlanDesignChangeReasonId == 0)
                {
                    ModelState.AddModelError("", $"Detail: {bfdvm.DetailName}. Error: Change reason required");
                }
                else if (bfdvm.Network == bfdvm.NetworkSaved
                        && bfdvm.OutOfNetwork == bfdvm.OutOfNetworkSaved
                        && bfdvm.LimitationsExceptions == bfdvm.LimitationsExceptionsSaved)
                {
                    ModelState.AddModelError("", $"Detail: {bfdvm.DetailName}. Error: Propose a change!");
                }

                if (bfdvm.PlanDesignStatusId == -1)
                {
                    updateStatus.AppendLine($"Detail: {bfdvm.DetailName}. Error: Already updated by another user");
                }
            }

            if (ModelState.IsValid && benefitForm != null)
            {
                new BenefitsManager().Update(benefitForm, User.Identity.Name, !GetCarrierIds().Contains(0), GetPlanPeriodId());
            }

            if (updateStatus.Length > 0)
            {
                ModelState.AddModelError("", updateStatus.ToString());
            }

            return Json(benefitForm.ToDataSourceResult(request, ModelState));
        }

        public ActionResult Respond(string groupFilter, string resFilter, string optionID, int? rsid, string coverage)
        {
            ViewData["PlanDesignChangeReasons"] = new LookupManager().GetChangeReasons(GetPlanPeriodId(), UserGroup());
            //if (coverage != null && rsid != null)
            //{
            //    var getCoverage = coverage.Split('-')[0].Trim();
            //    var getCarveouts = db.tblCoverageTypes.Where(x => x.CoverageType == getCoverage).FirstOrDefault();
            //    if (getCarveouts != null && getCarveouts.CoverageTypeID != 1)
            //    {
            //        ViewBag.Coverage = getCoverage;
            //    }
            //    else
            //    {
            //        if (getCoverage.ToLower() == "non")
            //        {
            //            getCoverage = getCoverage + "-" + coverage.Split('-')[1].Trim();
            //        }
            //        ViewBag.Coverage = BenefitForm.GetCoverage(getCoverage);
            //    }
            //    ViewBag.RSID = rsid;
            //}
            ViewBag.ShowGroupName = (groupFilter != null && groupFilter == "Y");// || Carrier.HasGroupedPlans(prsRenewal.PlanPeriodId, GetCarrierIds()) ? true : false;
            ViewBag.FilterGroupName = groupFilter != null && groupFilter == "Y" ? true : false;
            ViewBag.Filter = resFilter != null && resFilter != "" ? resFilter : "";
            ViewBag.OptionID = optionID != null && optionID != "" ? optionID : "";
            //ViewBag.ShowAdminMenu = IsPrsAdmin();

            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken()]
        public ActionResult Approve(string id)
        {
            bool saved = true;
            string message = "";

            try
            {
                List<string> planDesignValueIds = id.Split(',').ToList();
                new BenefitsManager().Approve(planDesignValueIds, User.Identity.Name, GetPlanPeriodId());
                message = planDesignValueIds.Count.ToString() + " plan design elements approved!";
            }
            catch (Exception e)
            {
                saved = false;
                message = "Error! Technical Support has been notified";

                Email.SendEmail("", "", "", "", "BHIRDV3(" + Startup.environment + ") Web Application Error",
                    "BenefitsController.Approve(): \n\n" + e.ToString());
            }

            return Json(new { success = saved, responseText = message });
        }

        [HttpPost]
        [ValidateAntiForgeryToken()]
        public ActionResult Reject([DataSourceRequest] DataSourceRequest request, RespondViewModel benefitFormDetail)
        {
            if (benefitFormDetail != null && ModelState.IsValid)
            {
                try
                {
                    if (!string.IsNullOrEmpty(benefitFormDetail.BenefitChangeReason.ChangeReason))
                    {
                        var allReasons = new LookupManager().GetChangeReasons(GetPlanPeriodId(), UserGroup());
                    }

                    new BenefitsManager().Reject(benefitFormDetail, User.Identity.Name, !GetCarrierIds().Contains(0), GetPlanPeriodId());
                }
                catch (Exception e)
                {
                    Email.SendEmail("", "", "", "", "BHIRDV3(" + Startup.environment + ") Web Application Error",
                        "BenefitsController.Reject(): \n\n" + e.ToString() + "\n\n" + Html.ToHtmlTable(benefitFormDetail));
                }

            }

            return Json(new[] { benefitFormDetail }.ToDataSourceResult(request, ModelState));
        }

        [HttpPost]
        [ValidateAntiForgeryToken()]
        public ActionResult CarrierBenefitSetName_Add(int CarrierId, string BenefitSetName)
        {
            try
            {
                int id = new BenefitsManager().CarrierBenefitSetName_Add(GetPlanPeriodId(), CarrierId, BenefitSetName);
                return Json(new { success = true, NewId = id });
            }
            catch (Exception e)
            {
                Email.SendEmail("", "", "", "", "BHIRDV3(" + Startup.environment + ") Web Application Error",
                    "BenefitsController.CarrierBenefitSetName_Add(): \n\n" + e.ToString() + "\n\n");

                return Json(new { success = false, NewId = 0 });
            }

        }


    }
}
