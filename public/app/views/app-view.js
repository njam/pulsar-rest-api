var app = app || {};

(function ($) {
	'use strict';

	app.AppView = Backbone.View.extend({

		el: '#pulsarapp',

		events: {
			'click #kill-task': 'killTask',
			'click #toggle-all': 'toggleAllComplete'
		},

		initialize: function () {
			this.$input = this.$('#new-todo');
			this.$footer = this.$('#footer');
			this.$main = this.$('#main');
			this.$list = $('#tasks-list');
            this.$count = $('#tasks-count');

			this.listenTo(app.tasks, 'add', this.addOne);
			this.listenTo(app.tasks, 'reset', this.addAll);
			this.listenTo(app.tasks, 'change:completed', this.filterOne);
			this.listenTo(app.tasks, 'filter', this.filterAll);
			this.listenTo(app.tasks, 'all', this.render);

			app.tasks.getFromServer();
			app.tasks.fetch({reset: true});
		},

		render: function () {
			var completed = app.tasks.completed().length;
			var remaining = app.tasks.remaining().length;

			if (app.tasks.length) {
                this.$count.html(app.tasks.length);
				this.$main.show();
				this.$footer.show();

				this.$('#filters li a')
					.removeClass('selected')
					.filter('[href="#/' + (app.TodoFilter || '') + '"]')
					.addClass('selected');
			} else {
				this.$main.hide();
				this.$footer.hide();
			}
		},

		addOne: function (task) {
			var view = new app.TaskView({ model: task });
			this.$list.append(view.render().el);
		},

		addAll: function () {
			this.$list.html('');
			app.tasks.each(this.addOne, this);
		},

		filterOne: function (task) {
			task.trigger('visible');
		},

		filterAll: function () {
			app.tasks.each(this.filterOne, this);
		},

		newAttributes: function () {
			return {
				title: this.$input.val().trim(),
				order: app.tasks.nextOrder(),
				completed: false
			};
		},

		clearCompleted: function () {
			_.invoke(app.tasks.completed(), 'destroy');
			return false;
		}

	});
})(jQuery);
