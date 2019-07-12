function ExchangeTransactionConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.exchangeTransaction', {
            url: '/exchange-transactions',
            controller: 'ExchangeTransactionCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/exchangeTransaction/exchangeTransaction.html',
            title: 'Send a transaction',
            params: {
            	address: ''
            }
        });

};

export default ExchangeTransactionConfig;