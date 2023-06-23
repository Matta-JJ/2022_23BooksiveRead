$(document).ready(function() {
    var books = Data;
    var BestBooks2016 = function() {
        var that = this;
        _.each(books, function(book, i) {
            book.img_url = that.img_url(book);
            //book.width = 12 / that.cols;
            book.visible = true;
            book.selected = false;
            book.book_id = i;
        });

        this.tags = this._makeTags();
        that.init();
    };

    BestBooks2016.prototype = {
        init: function() {
            this.render();
        },

        render: function() {
            $("#container").html(Mustache.render(Template, this.config()));
            this.initEvents();
        },

        initEvents: function() {
            var that = this;
            $(".sidebar li").click(function(e) {
                var $el = $(e.target);
                var tag = _.find(that.tags, function(tag_) {
                    return tag_.tag_id === $el.data("tag_id");
                });

                if ($el.data("tag_id") === "reset" || tag.selected) {
                    that.reset();
                } else {
                    _.each(books, function(book) {
                        book.visible = _.includes(book.tags.split(/, ?/), tag.name);
                    });
                    _.each(that.tags, function(tag_) {
                        tag_.selected = tag_.tag_id === tag.tag_id;
                    });
                }

                that.render();
            });
            $(".grid img").click(function(e) {
                var $el = $(e.target);
                var book = _.find(books, function(book_) {
                    return book_.book_id === $el.data("book_id");
                });

                _.each(books, function(book_) {
                    book_.selected = false;
                });

                book.selected = true;

                that.setParam("selected_book_id", book.book_id);
                that.render();
            });
        },

        reset: function() {
            _.each(books, function(book) {
                book.visible = true;
            });
            _.each(this.tags, function(tag) {
                tag.selected = false;
            });
            this.render();
        },

        rows: function() {
            var that = this;
            var selected_book_id = this.getParams()["selected_book_id"];

            if (selected_book_id) {
                _.each(books, function(book) {
                    book.selected = (book.book_id === parseInt(selected_book_id));
                });
            }

            return _.chunk(_.filter(books, function(book) {
                return book.visible;
            }), that.cols());
        },

        cols: function() {
            if (this.selectedBook()) {
                return 3;
            } else {
                return 6;
            }
        },

        config: function() {
            return {
                books: this.rows(),
                tags: this.getTags(),
                selected_book: this.selectedBook()
            };
        },

        getTags: function() {
            // var selected_tag_id = this.getParams()["selected_tag_id"];
            // if (selected_tag_id) {
            //     _.each(this.tags, function(tag) {
            //         tag.selected = (tag.tag_id === selected_tag_id);
            //     });
            // }
            return this.tags;
        },

        selectedBook: function() {
            return _.find(books, function(book) {
                return book.selected;
            });
        },

        _makeTags: function() {
            return _.map(_.uniq(_.flatten(_.map(books, function(book) {
                return book.tags.split(/, ?/);
            }))), function(tag) {
                return {
                    name: tag,
                    tag_id: tag.replace(" ", "-"),
                    selected: false
                }
            });
        },

        img_url: function(book) {
            return "/imgs/books_2016/" + book.title.replace(/[:'. $?-]/g, "_") + ".jpg";
        },

        getParams: function() {
            return _.fromPairs(_.compact(_.map(location.search.slice(1).split('&'), function(item) {
                if (item) return item.split('=');
            })));
        },


        setParam: function(key, value) {
            key = escape(key);
            value = escape(value);

            var kvp = document.location.search.substr(1).split('&');
            if (kvp == '') {
                document.location.search = '?' + key + '=' + value;
            } else {

                var i = kvp.length;
                var x;
                while (i--) {
                    x = kvp[i].split('=');

                    if (x[0] == key) {
                        x[1] = value;
                        kvp[i] = x.join('=');
                        break;
                    }
                }

                if (i < 0) {
                    kvp[kvp.length] = [key, value].join('=');
                }
                if (window.history.pushState) {
                    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + kvp.join("&");
                    window.history.pushState({
                        path: newurl
                    }, '', newurl);
                }
            }
        }

    };


    new BestBooks2016();
});
