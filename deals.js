// dojo requires
dojo.require('dojox.mobile.parser');
dojo.require('dojox.mobile');
dojo.require('dojox.mobile.ScrollableView');
dojo.require('dojox.mobile.TextBox');
dojo.require('dojox.mobile.Button');
dojo.require('dojo.io.script');
dojo.require('dojo.on');

// global vars
var baseApiUrl = 'http://api.mccrager.com';

// dom ready hook
dojo.ready(function () {
    initialize(false);

    dojo.on(window, 'onorientationchange', scrollToTop);
    dojo.on(dojo.byId('home-heading'), 'click', scrollToTop);
    dojo.on(dojo.byId('deal-heading'), 'click', scrollToTop);
    dojo.on(dojo.byId('search-heading'), 'click', scrollToTop);

    dojo.removeClass(dojo.byId('disclaimer'), 'hidden');
    dojo.removeClass(dojo.byId('search-toolbar'), 'hidden');
});

// fetch front page deals
function initialize(isRefresh) {
    window.scrollTo(0, 1);
    dojo.setStyle(dijit.byId('home').containerNode, { '-webkit-transform': '', 'webkitTransform': '', 'top': '0', 'left': '0' });

    dijit.byId('home-heading').set('label', 'Passwird Deals');
    list = dijit.byId('deals');
    loading = getLoadingListItem('Loading deals...');
    list.destroyDescendants();
    list.addChild(loading);

    params = { type: 'jsonp' };
    if (isRefresh) {
        params.r = Math.random();
    }
    dojo.io.script.get({
        url: baseApiUrl + '/passwird',
        callbackParamName: 'callback',
        content: params,
        timeout: 5000,
        load: function (data) {
            list.destroyDescendants();
            dojo.forEach(data, function (deal, index) {
                listItem = new dojox.mobile.ListItem({
                    icon: deal.image,
                    label: deal.headline,
                    rightText: (deal.isExpired ? '(expired)' : ''),
                    clickable: true
                });
                list.addChild(listItem);

                dojo.on(listItem, 'click', function () {
                    scrollToTop(null);

                    view = dijit.byId('home');
                    headline = dojo.byId('headline');
                    body = dojo.byId('body');
                    heading = dijit.byId('deal-heading');

                    heading.moveTo = 'home';
                    headline.innerHTML = deal.headline + (deal.isExpired ? ' <span style="color: red;">(expired)</span>' : '');
                    body.innerHTML = deal.body;
                    view.performTransition('deal', 1, 'slide');
                });
            });
        },
        error: function (error) {
            dojo.byId(loading.id).innerHTML = 'Error, please try again.';
        }
    });
}

// search for deals
function search(btn) {
    dojo.setAttr(btn, 'disabled', 'disabled');

    scrollToTop(null);

    list = dijit.byId('search-results');
    dojo.removeClass(dojo.byId(list.id), 'hidden');
    list.destroyDescendants();
    loading = getLoadingListItem('Searching...');
    list.addChild(loading);

    dojo.io.script.get({
        url: baseApiUrl + '/passwirdsearch',
        callbackParamName: 'callback',
        content: {
            type: 'jsonp',
            q: dojo.byId('query').value
        },
        timeout: 25000,
        load: function (data) {
            list.destroyDescendants();

            if (isEmpty(data)) {
                listItem = new dojox.mobile.ListItem({
                    label: 'No results found.'
                });
                list.addChild(listItem);
            }
            dojo.forEach(data, function (deal, index) {
                listItem = new dojox.mobile.ListItem({
                    icon: deal.image,
                    label: deal.headline,
                    rightText: (deal.isExpired ? '(expired)' : ''),
                    moveTo: 'deal'
                });
                list.addChild(listItem);

                dojo.on(listItem, 'click', function () {
                    scrollToTop(null);

                    view = dijit.byId('search');
                    headline = dojo.byId('headline');
                    body = dojo.byId('body');
                    heading = dijit.byId('deal-heading');

                    heading.moveTo = 'search';
                    headline.innerHTML = deal.headline + (deal.isExpired ? ' <span style="color: red;">(expired)</span>' : '');
                    body.innerHTML = deal.body;
                    view.performTransition('deal', 1, 'slide');
                });
            });
            dojo.removeAttr(btn, 'disabled');
        },
        error: function (error) {
            dojo.byId(loading.id).innerHTML = 'Error, please try again.';
        }
    });
}

// scroll the browser to the top
function scrollToTop(evt) {
    window.scrollTo(0, 1);
    dijit.byId('deals').resize();
}

// add isEmpty method to Object prototype
function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

// generate loading list item while fetching data
function getLoadingListItem(s) {
    obj = new dojox.mobile.ListItem({
        icon: 'loader.gif',
        label: s
    });
    return obj;
}