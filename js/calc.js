/*
* ES 5.1
* camelCase
* */


// defaults structure for goal
const defaults = {
    cy: '₽',
    name: 'Цель',
    // (today + 1 year).parse("YYYY-mm-dd")
    date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).yyyymmdd("-"),

    /* Base */
    dream: "", // totalMoney
    inCom: "",
    expense: "",
    gain: 0,
    // TODO ? : result: resultPercent

    /* Percent */
    broker: 0,
    brokerPercent: 70,
    pillow: 0,
    pillowPercent: 20,
    reserve: 0,
    reservePercent: 10,

    /* rightNow */
    rightNow: "",
    pillowRightNow: "",
    reserveRightNow: ""

};
/* Str[] to goal[] */
Object.getPrototypeOf(localStorage).asArrayOfObj = function () {
    var res = [];
    for (var i = 0; i < this.length; i++) {
        try {
            res.push(JSON.parse(this[i]));
        } catch (e) {
            console.log("Error index in localStorage");
        }
    }

    return res;
};
/* Calc table data */
Object.getPrototypeOf(localStorage).calcTable = function () {
    // this === app.goals === localStorage
    // structure of aims[i]  = structure of defaults
    var aims = this.asArrayOfObj();
    var table = [];

    for(var i=0;i<aims.length;i++){
        // Structure of row
        const row = {
            date: (aims[i].date- new Date()),// see example
            totalMoney: aims[i].rightNow + aims[i].broker + aims[i].reserve, // see Example
            broker:0,
            pillow:0,
            reserve:0,
            checked: false
        };

        // TODO: @Vonvee your code here
        /* example
        row.date = aims[i].date;
        row.totalMoney = aims[i].rightNow + aims[i].broker + aims[i].reserve;
        var percentsCorrelation = [ aims[i].brokerPercent, aims[i].brokerPercent, aims[i].pillowPercent ];
        */

        table.push(row);
    }

    return table;
};

/* Remove like ListArray */
Object.getPrototypeOf(localStorage).safeRemove = function (index) {
    for (var i = index; i < this.length; i++) {
        this[i] = this[i + 1]
    }
    delete this[this.length - 1];
};
// Primary start
if (localStorage.length === 0) localStorage[0] = JSON.stringify(defaults);
var canDel = false;
var app = new Vue({
    el: "#app",
    data: {
        current: JSON.parse(localStorage[0]),
        // Really shit is Magic Link
        goals: localStorage,
        // current index
        i: 0
    },
    computed: {
        resultPercent: function () {
            var aimTime = Date.diff(new Date(), new Date(this.current.date))[1];
            var moneyWithoutPercents = this.current.rightNow + this.current.gain * aimTime;
            var numberOfFullPeriods = aimTime / 12;
            var profit = (this.current.dream - moneyWithoutPercents) / numberOfFullPeriods;
            var result = ((profit+ moneyWithoutPercents) / moneyWithoutPercents - 1) * 100;

            if (result < 0) {
                result = "Цель выполнится накоплением без вкладов."
            } else if (result > 50) {
                result = "Выполнение цели недостижимо в данные сроки."
            }

            // Fix
            if (isNaN(result)) result = 0;
            return result;
        }
    },
    watch: {
        // react saving in localStorage
        current: {
            handler: function () {
                this.goals[this.i] = JSON.stringify(this.current);
            },
            deep: true
        }
    },
    methods: {
        newTab: function () {
            this.current = JSON.parse(JSON.stringify(defaults));
            this.goals[this.goals.length] = JSON.stringify(this.current);
            this.i = this.goals.length - 1;
        },
        delTab: function () {
            // Fix deep events
            canDel = true;
        },
        setActive: function (key) {
            // has click delTab early
            if (canDel) {
                canDel = false;
                // delTab:
                this.goals.safeRemove(key);
                // offset
                key = 0;
            }
            // SetActive :
            this.current = JSON.parse(this.goals[key]);
            this.i = key;

        }
    }
});

// Change place by prior
$("#prior").change(function () {
    // app.goals === localStorage
    var t = app.goals[this.value];
    app.goals[this.value] = app.goals[app.i];
    app.goals[app.i] = t;

    app.i = this.value;
});