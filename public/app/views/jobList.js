var app = app || {};

(function($) {
  'use strict';

  app.JobListView = Backbone.View.extend({

    initialize: function() {
      this.$count = $('#job-count');
      this.listenTo(this.collection, 'add', this.addItem);
    },

    addItem: function() {
      console.log('####', arguments);
    },

    render: function() {
      this.$count.html(this.collection.length);
      var $body = this.$el.find('tbody');
      $body.html('');
      this.collection.each(function(job) {
        var view = new app.JobListItemView({model: job});
        view.render();
        $body.prepend(view.el);
      }, this);

      this.$el.footable();
    }

  });

})(jQuery);
