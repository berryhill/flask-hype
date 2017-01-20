$(function() {
    SC.initialize({
        client_id: '3f2ab0fcb9afd13013193f3a84f506e4',
        redirect_uri: 'http://localhost:8080/callback.html'
    });
    console.log('----');
    var api_key = 'WDYCZCJAXVBSXH24U';
    var artist;
    if (artist === undefined) artist = "MilesDavis";
    artist = artist.replace(/\s/g, ' ');
    var band = artist; //hackish rename
    var echonest = new EchoNest(api_key);
    var suggested = echonest.artist().top_hottt(function(topHotttCollection) {
        //console.log(topHotttCollection.data.artists[0].name);
        var i = 0;
        for (i; i < topHotttCollection.data.artists.length; i++) {
            console.log(i);
            $('.suggested').append('<h3><a>' + topHotttCollection.data.artists[i].name + '</a></h3>');
        }
        return topHotttCollection.data.artists[0].name
    });
    var EchoModel = Backbone.Model.extend({});
    var EchoCollection = Backbone.Collection.extend({
        artist: artist,
        model: EchoModel,
        url: 'http://developer.echonest.com/api/v4/artist/profile?api_key=WDYCZCJAXVBSXH24U&name=' + artist + '&bucket=hotttnesss&bucket=familiarity&bucket=terms&bucket=biographies&bucket=images',
        // url: 'http://developer.echonest.com/api/v4/' +
        // 'profile?api_key=WDYCZCJAXVBSXH24U&name=' + artist + '&bucket=hotttnesss&bucket=familiarity&bucket=terms&bucket=biographies&bucket=images',

        sync: function(method, collection, options) {
            options.dataType = "json";
            return Backbone.sync(method, collection, options);
        },
        parse: function(response) {
            //console.log(response);
            return response;

        }
    });
    var collection = new EchoCollection();
    var ArtistList = Backbone.View.extend({
        el: 'body',
        initialize: function() {
            this.render();
            $('.container').fadeOut(300);
            $('.suggested').html('<hr>');
            var hypem = 'https://api.hypem.com/v2/artists?sort=popular&key=swagger';
            $.get(hypem, function(response) {
                success: $.each(response, function(i) {
                    console.log(response[i]);
                    $('.suggested').append('<h3><a>' + response[i].artist + '</a></h3>' + '<p><img src="' + response[i].thumb_url_artist + '"/></p>');
                })
            });
        },
        render: function() {
            var template = _.template('<h1 class="artist"><%=stuff.response.artist.name %></h1><div id="fam"></div>');
            var navTemplate = _.template('<p></p>');
            var artist = $('input').val();
        },
        events: {
            "keyup .search": "fetch",
            "hover .nameField": "nameChanged",
            "click #fetch": "fetch",
            "click a": 'fetch'
        },
        fetch: function(e) {
            var p = e.target;
            var newName = $('.search').val() || e.currentTarget.firstChild.data;
            console.log(newName);
            if (event.keyCode == 13 || 1) {
                $('.hero-unit').html('<h6>Flickr</h6>');
                $('.bios').html('<p></p>');
                $('#terms').html('<p></p>');
                $('.list').html('<p></p>');
                $('.news').html('<p></p>');
                $('.soundcloud').html('<p></p>');
                var back = ["#FFFFD5", "#E5E5BF", "#BFBF9F", "#7F7F6A", "#404035"];
                var color = back[Math.floor(Math.random() * back.length)];
                console.log(e);
                $('.suggested').fadeOut(300);
                $('.container').fadeIn(1000);
                collection.fetch({
                    url: 'http://developer.echonest.com/api/v4/artist/profile?api_key=WDYCZCJAXVBSXH24U&name=' + newName + '&bucket=hotttnesss&bucket=familiarity&bucket=terms&bucket=biographies&bucket=images',
                    success: function(collection, response, options) {
                        var res = collection.models[0].attributes.response.artist;
                        var status = collection.models[0].attributes.response.status;
                        if (status.code === 5) {
                            $('.container').fadeOut(1000);
                            $('.container').html("<h1 style='postion:absolute;top:45%;'>Not Found...</h1>");
                        }
                        if (res.name === undefined) {
                            // console.log(collection.models);
                        }
                        //console.log('hotttnesss: ', res.hotttnesss);
                        //console.log('familiarity: ', res.familiarity);
                        var items = new DataCollection([{
                                name: res.name,
                                data: [res.hotttnesss, res.familiarity]
                            }
                            /*, {
                                                                name: 'Giles Peterson',
                                                                data: [-0.2, 0.8]
                                                            },*/
                        ]);
                        var view = new DataView({
                            data: items
                        });
                        view.render();
                        $('#fam').append('<p>' + res.familiarity + '</p>');
                        $('#hottt').append('<p>' + res.hotttnesss + '</p>');
                        _.each(res.terms, function(term) {
                            console.log(term.name);
                            $('#terms').append('<p>' + term.name + '</p>');
                        });
                        echonest.artist(newName).news(function(newsCollection) {
                                _.each(newsCollection.data.news, function(news) {
                                    $('.news').append('<hr>' + '<h4>' + news.name + '</h4><p>' + news.date_found + '</p>' + news.summary + '<div>')
                                });
                                $(p).parent().css('background', color);
                                $('header h1').css('color', '#7F4922');
                                $.get('https://api.soundcloud.com/tracks?client_id=3f2ab0fcb9afd13013193f3a84f506e4&q=' + res.name, function(response) {
                                    success: _.each(response, function(i) {
                                        //console.log(i.stream_url, i.id, i);
                                        $('.soundcloud').append('<hr>');
                                        $('.soundcloud').append('<div id=' + i.id + '></div');
                                        var oembedElement = $('div#' + i.id);
                                        SC.oEmbed(i.permalink_url, {
                                            element: oembedElement
                                        }).then(function(result) {
                                            $('div#' + i.id).html(result.html);
                                            console.log('oembed', result);
                                        }).catch(function(err) {
                                            console.log('oembed err', err);
                                        });
                                    })
                                })
                            })
                            /*$.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",
                              {
                                tags: newName,
                                tagmode: "any",
                                format: "json"
                              },
                              function(data) {
                                $.each(data.items, function(i,item){
                                  $("<img/>").attr("src", item.media.m).appendTo(".hero-unit");
                                  if ( i == 5 ) return false;
                                });
                            }); */
                        /*    _.each(res.biographies, function (bio){
                             $('.bios').append('<hr>' +'<p class="bio">' + bio.text + '</p>');
                         }); */
                        return response;
                    },
                    error: function(collection, response, options) {
                        console.log(response);
                        alert('Please try again.');
                    }
                });
            }
        },
        nameChanged: function() {
            console.log('search');
            if (event.keyCode == 13) {
                console.log('Artist model changed...');
                var newName = $('.search').val();
                console.log(newName);
                collection.fetch({
                    success: function(collection, response, options) {
                        var res = collection.models[0].attributes.response.artist;
                        console.log(res);
                        console.log('Name: ', res.name);
                        console.log('hotttnesss: ', res.hotttnesss);
                        console.log('familiarity: ', res.familiarity);
                        _.each(res.biographies, function(bio) {
                            $('.bios').append('<hr>' + '<p class="bio">' + bio.text + '</p>');
                        });
                        console.log('biographies: ', res.biographies);
                        console.log('images: ', res.images);
                        $('#fam').append('<p>' + res.familiarity + '</p>');
                        $('#hottt').append('<p>' + res.hotttnesss + '</p>');
                        _.each(res.terms, function(term) {
                            //   console.log(term);
                            console.log(term.name);
                            $('#terms').append('<p>' + term.name + '</p>');
                        });
                        echonest.artist(band).news(function(newsCollection) {
                            console.log(newsCollection);
                            _.each(newsCollection.data.news, function(news) {
                                $('.news').append('<hr>' + news.summary + '<div>')
                            });
                        });
                        return response;
                    },
                    error: function(collection, response, options) {
                        console.log(response);
                    }
                });
            }
        }
    });
    var artistList = new ArtistList();
    var DataModel = Backbone.Model.extend({});
    var DataCollection = Backbone.Collection.extend({
        model: DataModel
    });
    var Artist = Backbone.Model.extend({
        defaults: {
            name: 'New Artist',
            birthday: 'January 1, 1970',
            hometown: 'Los Angeles, CA',
            favoriteColor: 'blue',
        },
        initialize: function() {
            console.log('New artist created...');
            console.log(this.attributes.name);
        }
    });
    //var anotherview = new DataView({ data: items });
    //anotherview.render();
    var DataView = Backbone.View.extend({
        data: {
            name: 'Bob'
        },
        el: '#container',
        initialize: function(options) {
            this.data = options.data;
        },
        render: function() {

            this.$el.highcharts({
                chart: {
                    type: 'column',
                    style: {
                        fontFamily: 'GreyscaleBasicRegular'
                    }
                },
                title: {
                    text: 'The comparison of familiarity and "hotttness" or novelty',
                    x: -20 //center
                },
                subtitle: {
                    //text: '-----',
                    x: -20
                },
                xAxis: {
                    categories: ['hotttnesss', 'familiarity']
                },
                yAxis: {
                    title: {
                        text: '...'
                    },
                    plotLines: [{
                        value: 0,
                        width: 0,
                        color: '#808080'
                    }]
                },
                tooltip: {
                    valueSuffix: '°C'
                },
                credits: {
                    enabled: false
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle',
                    borderWidth: 0
                },
                series: this.data.toJSON()
            });
        }
    });
    collection.fetch({
        success: function(collection, response, options) {
            var res = collection.models[0].attributes.response.artist;
            var items = new DataCollection([{
                    name: res.name,
                    data: [res.hotttnesss, res.familiarity]
                }
                /*, {
                                    name: 'Giles Peterson',
                                    data: [-0.2, 0.8]
                    },*/
            ]);
            var view = new DataView({
                data: items
            });
            view.render();
            return response;
        },
        error: function(collection, response, options) {
            console.log(response);
        }
    });
});
