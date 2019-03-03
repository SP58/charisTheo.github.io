var app = angular.module('Portfolio', ['ngMaterial', 'ngCookies']);
    
app
.config(["$mdThemingProvider", function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('deep-purple')
        .accentPalette('green');
}])
.directive('svgLogo', function() {
    return {
        scope: false,
        restrict: 'E',
        templateUrl: './../partials/svgLogo.html'
    }
})
.directive('socialLinks', function() {
    return {
        scope: false,
        restrict: 'E',
        templateUrl: '/partials/socialLinks.html'
    }
})
.directive('sideNavList', function() {
    return {
        scope: {
            onContactClick: '&',
            onHireMeClick: '&'
        },
        restrict: 'E',
        templateUrl: '/partials/sidenavList.html',
    }
})
.directive('pageLoader', function() {
    return {
        scope: false,
        restrict: 'E',
        templateUrl: '/partials/page-loader.html'
    }
})
.directive('imagePicker', function() {
    return {
        scope: false,
        restrict: 'E',
        templateUrl: '/partials/imagePicker.html',
        link: function(scope, elm, attrs) {
            scope.images = JSON.parse(attrs.images);
            scope.selectedImage = 0;
            scope.selectImage = function(index) {
                scope.selectedImage = index;
            }
        }
    }
});

(function(){
    'use strict';

    angular
        .module('Portfolio')
        .controller('PortfolioCtrl', PortfolioCtrl);

    PortfolioCtrl.$inject = ["$scope", "$http", "$mdSidenav", "$mdMedia", "ShareListener", "$cookies"];

    function PortfolioCtrl($scope, $http, $mdSidenav, $mdMedia, ShareListener, $cookies) {
        $http.get('/projects.data.json').then(function(response) {
            $scope.projects = response.data;
        });
        $scope.$mdMedia = $mdMedia;

        $scope.shareButtonListener = ShareListener.listener;
        $scope.copyToClipboard = ShareListener.copyToClipboard;

        $scope.nightMode = false;
        $scope.documentLoaded = false;
        $scope.showProfilePhoto = false;
        $scope.cardToggle = false;
        $scope.selectedCardIndex = undefined;
        $scope.selectedCard = undefined;

        $scope.toggleSocialLinks = function() {
            $scope.showSocialLinks = !$scope.showSocialLinks;
            // close side nav if open
            if ($mdSidenav('left').isOpen) {
                $mdSidenav('left').toggle();
            }
        };
        $scope.togglePeoplePerHourWidget = function() {
            $scope.showPeoplePerHourWidget = !$scope.showPeoplePerHourWidget;
            // close side nav if open
            if ($mdSidenav('left').isOpen) {
                $mdSidenav('left').toggle();
            }
        }
        
        // angular.element(document).ready(function () {
        //     $scope.showProfilePhoto = true;
        //     $scope.documentLoaded = true;
        // });
        $scope.$watch('$viewContentLoaded', function(){
            if (!$cookies.get("IS_FOLLOWING") && !$cookies.get("HIDE_FOLLOWING_PROMPT")) {
                $scope.showProfilePhoto = true;
            }
            if ($cookies.get("NIGHT_MODE") === 'on') {
                $scope.nightMode = true;
            }
            $scope.documentLoaded = true;
        });

        $scope.selectCard = function($event, $index) {
            if ($scope.selectedCardIndex != $index) {
                // select card
                $scope.selectedCard = $scope.projects[$index];
                $scope.selectedCardIndex = $index;
            } else {
                // unselect card
                $scope.selectedCardIndex = undefined;
                $scope.selectedCard = undefined;
            }
            $event.cancelBubble = true; // prevent from firing again
        }

        $scope.onFavouriteClick = function($event) {
            // TODO: Add animation transition
            let _this = $event.currentTarget;
            let iconContent = _this.children[0].textContent;
            console.log(iconContent);
            if (iconContent == 'favorite') {
                _this.children[0].textContent = 'favorite_border';
            } else {
                _this.children[0].textContent = 'favorite';
            }
            $event.cancelBubble = true; // prevent the card from toggling
        }

        $scope.onFollowMeClick = function($event) {
            // store cookie
            $cookies.put("IS_FOLLOWING", "true");
            // hide picture
            $scope.showProfilePhoto = false;                
            // event redirects to href link
        }
        
        $scope.onCloseProfileClick = function() {
            let currentDate = new Date();
            // set cookie for 1 week
            currentDate.setDate(currentDate.getDate() + 7);
            $cookies.put("HIDE_FOLLOWING_PROMPT", "true", {expires: currentDate});
            // hide following prompt
            $scope.showProfilePhoto = false;
        }

        $scope.toggleSideNav = function() {
            $mdSidenav('left').toggle();
        }
        
        $scope.toggleNightMode = function() {
            // toggle
            $scope.nightMode = !$scope.nightMode;
            // store cookie
            if ($scope.nightMode) {
                $cookies.put("NIGHT_MODE", "on");
            } else {
                $cookies.put("NIGHT_MODE", "off");
            }
        }
    }

})();
(function(){
    'use strict';

    angular
        .module('Portfolio')
        .factory('ShareListener', ["$mdToast", function($mdToast) {
            const copyToClipboard = function(str) {
                const el = document.createElement('textarea');
                el.value = str;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                // show Toast message
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Link copied to clipboard!')
                    .hideDelay(2000)      
                );
            };

            function listener($event) {
                $event.preventDefault();
                //cancel bubble
                let _this = $event.currentTarget;
                if (navigator.share) {
                    navigator.share({
                        title: 'CharisTheo',
                        text: _this.children[0].textContent,
                        url: _this.href,
                    })
                    .then(() => console.log('Successful share'))
                    .catch((error) => console.log('Error sharing', error));
                } else {
                    // No share API found!
                    // copy link to clipboard
                    copyToClipboard(_this.href);
                }
                $event.cancelBubble = true; // prevent the card from toggling
            }

            return {
                listener: listener,
                copyToClipboard: copyToClipboard
            }
        }]);
}());
let eye = document.getElementsByClassName('eye')[0];
let irises = document.getElementsByClassName('iris');
let styles = window.getComputedStyle(eye);

window.onload = function(){
    document.onmousemove = function(e) {
        let x = e.pageX;
        let y = e.pageY;
        tilt(x, y);    
    }
}

if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", function (event) {
        let x = (event.gamma * (10))/90;
        let y = (event.beta * (10))/90;
        tilt([x, y]);
    }, true);
} else if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', function (event) {
        let accX = Math.round(event.accelerationIncludingGravity.x*10) / 10;  
        let accY = Math.round(event.accelerationIncludingGravity.y*10) / 10;
        let x = (styles.width) - (accX*movement);
        let y = (styles.height) - (accY*movement);    
        // let x = 10/2 - event.acceleration.x * 5;
        // let y = 10/2 - event.acceleration.y * 5;
        tilt([x, y]);
    }, true);
} else {
    window.addEventListener("MozOrientation", function (event) {
        let x = 10 - event.orientation.x * 50;
        let y = styles.width - event.orientation.y * 50;
        tilt([x, y]);
    }, true);
}

function tilt(x, y) {
    let moveX = parseInt(x * 0.007) - 1;
    let moveY = parseInt(y * 0.006);

    irises[0].style.left = `${moveX}px`;
    irises[1].style.left = `${moveX}px`;

    if (y < window.innerHeight - 100) {
        // on the bottom half of the screen
        irises[0].style.top = `${moveY}px`;
        irises[1].style.top = `${moveY}px`;
    } else {
        // on the top half of the screen
        irises[0].style.bottom = `${moveY}px`;        
        irises[1].style.bottom = `${moveY}px`;        
    }
}
