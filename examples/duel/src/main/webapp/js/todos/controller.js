/*global window */
/*jshint camelcase:false */

var todos = todos || {};

(function (todos, document) {
	'use strict';

	/*-- private members -------------------------------*/

	var ESC_KEY = 27;
	var ENTER_KEY = 13;

	function find(selector, scope) {
		return (scope || document).querySelector(selector);
	}

	function refreshView() {
		// get the data
		var data = {
			tasks: todos.model.tasks(),
			stats: todos.model.stats()
		};

		// build the view
		var view = todos.views.TodoApp(data).toDOM();

		var old = find('.todoapp');
		if (old) {
			// replace old task list
			old.parentNode.replaceChild(view, old);
		} else {
			// insert at top
			document.body.insertBefore(view, document.body.firstChild);
		}
		find('.new-todo').focus();
	}

	function add(input) {
		var title = (input.value || '').trim();
		input.value = '';

		if (!title) {
			return;
		}

		todos.model.add(title);
		refreshView();
	}

	function edit(input, id) {
		var title = (input.value || '').trim();
		input.value = title;

		if (title) {
			todos.model.edit(id, title);
		} else {
			todos.model.remove(id);
		}
		refreshView();
	}

	function reset(input, id) {
		var task = todos.model.find(id);
		if (task) {
			input.value = task.title;
		}
	}

	/*-- export public interface -------------------------------*/

	// event handlers
	todos.actions = {
		add_keypress: function (e) {
			if (e.keyCode === ENTER_KEY) {
				add(this);
			} else if (e.keyCode === ESC_KEY) {
				refreshView();
			}
		},

		edit_blur: function (id) {
			// create a closure around the ID
			return function () {
				edit(this, id);
			};
		},

		edit_keypress: function (id) {
			// create a closure around the ID
			return function (e) {
				if (e.keyCode === ENTER_KEY) {
					// just blur so doesn't get triggered twice
					this.blur();
				} else if (e.keyCode === ESC_KEY) {
					reset(this, id);
					this.blur();
				}
			};
		},

		remove_click: function (id) {
			// create a closure around the ID
			return function () {
				todos.model.remove(id);
				refreshView();
			};
		},

		clear_click: function () {
			todos.model.expunge();
			refreshView();
		},

		content_dblclick: function () {
			var li = this;
			while (li.tagName !== 'LI') {
				li = li.parentNode;
			}

			li.className = 'editing';

			var input = find('input[type=text]', li);
			if (input) {
				input.focus();
			}
		},

		completed_change: function (id) {
			// create a closure around the ID
			return function () {
				var checkbox = this;
				todos.model.toggle(id, checkbox.checked);
				refreshView();
			};
		},

		toggle_change: function () {
			var checkbox = this;
			todos.model.toggleAll(checkbox.checked);
			refreshView();
		}
	};

	/*-- init task list -------------------------------*/
	refreshView();

})(todos, window.document);
