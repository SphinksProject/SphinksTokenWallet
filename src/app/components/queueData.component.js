import nem from "nem-sdk";
import Helpers from '../utils/helpers';

class QueueDataCtrl {

    /**
     * Initialize dependencies and properties
     *
     * @params {services} - Angular services to inject
     */
    constructor(AppConstants, Alert, $timeout, $scope, $http) {
        'ngInject';

        //// Component dependencies region ////

        this._AppConstants = AppConstants;
        this._Alert = Alert;
        this._$timeout = $timeout;
        this._Helpers = Helpers;
        this._$http = $http;
        this._$scope = $scope;

        this.url = this._AppConstants.tis_url;

        this.isON = true;

        this._$scope.$on("$destroy", () => {
            this.isON = false;
        });

        this.refreshInfo();
    }

    //// Component methods region ////

  	/**
  	 * Refresh information
  	 */
  	refreshInfo() {
        if (!this.isON) {
            return;
        }

        this._$http.get(this.url + "/api/sphinks/queue-size").then((res) => {
            this._$timeout(() => {
                this.queue_size = res.data.size;
            });
          },
          (err) => {
              this._$timeout(() => {
                  this._Alert.errorGetQueueInfo();
              });
          });

          this._$timeout(()=>{
              this.refreshInfo();
          }, 60000);
  	}

    //// End methods region ////

}

// QueueData config
let QueueData = {
    controller: QueueDataCtrl,
    templateUrl: 'layout/partials/queueData.html'
};

export default QueueData;
