import nem from 'nem-sdk';

// Unique id for each tx, start with 0
let txId = 0;

function TagRequest(Wallet, $state, AddressBook, DataStore) {
    'ngInject';

    return {
        restrict: 'E',
        scope: {
            d: '=',
            a: '=',
            tooltipPosition: '='
        },
        template: '<ng-include src="templateUri"/>',
        link: (scope) => {
                scope.number = txId++;
                scope.mainAccount = scope.a || Wallet.currentAccount.address;

            scope.tx = scope.d;
            scope.parent = undefined;

            // Get the correct line template
            scope.templateUri = 'layout/lines/lineRequest.html';

            scope.networkId = Wallet.network;

            /**
             * Return contact label for an address
             *
             * @param {string} address - The address to look for
             *
             * @return {string|boolean} - The account label or false
             */
            scope.getContact = (address) => {
                return AddressBook.getContact(Wallet.current, address);
            }
        }
    };
}

export default TagRequest;
