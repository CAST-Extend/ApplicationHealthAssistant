import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export default class DataStateService {
    insightData: any;

    /**
     *
     */
    getInsightData() {
        return this.insightData;
    }

    /**
     *
     * @param appData
     */
    setInsightData(appData: any) {
        this.insightData = appData;
    }
}
