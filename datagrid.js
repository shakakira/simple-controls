//作为一个控件，它的容器必须传入
function DataGrid(element) {
	this.columns = [];
	this.rows = [];

	element.innerHTML = '<table class="table table-bordered table-striped"><thead><tr></tr></thead><tbody></tbody><table>';

	this.header = element.firstChild.tHead.rows[0];
	this.tbody = element.firstChild.tBodies[0];

	this.selectedRow = null;
}

DataGrid.prototype = {
	loadColumns: function(columns) {
		var headStr = "";
		for (var i=0; i<columns.length; i++) {
			headStr += "<th>" + columns[i].label + "</th>";
		}
		this.header.innerHTML = headStr;
		this.columns = columns;
	},

	loadData: function(data) {
		for (var i=0; i<data.length; i++) {
			this.insertRow(data[i]);
		}
		
		//跟外面说一声，数据加载好了
		var event = {
			type: "loadComplete",
			target: this
		};
		this.dispatchEvent(event);
	},

	insertRow: function(data) {
		var row = new DataRow(data, this);
		this.tbody.appendChild(row.dom);

		this.rows.push(row);

		var that = this;
		row.addEventListener("select", function(event) {
			that.select(event.row);
		});


		//已经成功添加了新行
		var event = {
			type: "rowInserted",
			newRow: row,
			target: this
		};
		this.dispatchEvent(event);
	},

	removeRow: function(row) {
		if (row === this.selectedRow) {
			this.selectedRow = null;
		}

		this.tbody.removeChild(row.dom);
		row.destroy();

		for (var i=0; i<this.rows.length; i++) {
			if (this.rows[i] == row)
			{
				this.rows.splice(i, 1);
				break;
			}
		}

		//已经移除
		var event = {
			type: "rowRemoved",
			target: this
		};
		this.dispatchEvent(event);
	},

	select: function(row) {
		var event = {
			type: "change",
			target: this,
			oldRow: this.selectedRow,
			newRow: row
		};

		if (this.selectedRow) {
			this.selectedRow.unselect();
		}

		if (row) {
			row.select();
		}

		this.selectedRow = row;

		this.dispatchEvent(event);
	}
}.extend(EventDispatcher);


function DataRow(data, grid) {
	this.data = data;
	this.grid = grid;

	this.create();
}

DataRow.prototype = {
	create: function() {
		var row = document.createElement("tr");
		for (var i=0; i<this.grid.columns.length; i++) {
			var cell = document.createElement("td");
			cell.innerHTML = this.data[this.grid.columns[i].field] || "";
			row.appendChild(cell);
		}
		this.dom = row;

		var that = this;
		row.onclick = function(event) {
			//通知上级，我被点了
			var newEvent = {
				type: "select",
				target: this,
				row: that
			};
			that.dispatchEvent(newEvent);
		}
	},

	destroy: function() {
		this.dom = null;
		this.data = null;
		this.grid = null;
	},

	select: function() {
		this.dom.className = "info";
	},

	unselect: function() {
		this.dom.className = "";
	},

	set: function(key, value) {
		this.data[key] = value;

		for (var i=0; i<this.grid.columns.length; i++) {
			if (this.grid.columns[i].field === key) {
				this.dom.childNodes[i].innerHTML = value;
				break;
			}
		}
	},

	get: function(key) {
		return this.data[key];
	},

	refresh: function(data) {
		this.data = data;

		for (var i=0; i<this.grid.columns.length; i++) {
			this.dom.childNodes[i].innerHTML = data[this.grid.columns[i].field] || "";
		}
	}
}.extend(EventDispatcher);
