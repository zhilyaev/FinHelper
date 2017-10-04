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
    diffMonths: 0,
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

    RecalculatePerc = function () {
        percentCorrelation.forEach(function (item, i, array) {
            var sum = array.reduce(function (a, b) {
                return a + b;
            }, 0);
            array[i] = item / sum
        });
    };

    AddRemainder = function (remainder, row) {
        row.broker += remainder * percentCorrelation.brokerPerc;
        row.pillow += remainder * percentCorrelation.pillowPerc;
        row.reserved += remainder * percentCorrelation.reservedPerc;
        //TODO: Please make it return null, and work directly with row data as link in C++ or ref in C#
        return row
    };
    var totalMonths = 0;
    for (var i = 0; i < aims.size; i++) {
        totalMonths += aims.totalMonths;
    }

    var resultData = [];

    for (i = 0; i < aims.length; i++) {
        // Structure of row
        var row = {
            // see example
            totalMoney: aims[i].rightNow + aims[i].broker + aims[i].reserve, // see Example
            broker: aims[i].broker,
            pillow: aims[i].pillow,
            reserve: aims[i].reserve,
            checked: false,
            priority: aims[i].priority
        };


        // TODO: @Vonvee your code here
        /* example
        row.date = aims[i].date;
        row.totalMoney = aims[i].rightNow + aims[i].broker + aims[i].reserve;
        var percentsCorrelation = [ aims[i].brokerPercent, aims[i].brokerPercent, aims[i].pillowPercent ];
        */

        var percentCorrelation = {
            //Todo(ez): get from data fields
            brokerPerc: aims[i].brokerPerc,
            pillowPerc: aims[i].pillowPerc,
            reservedPerc: aims[i].reservedPerc
        };
        var aimExtra = 0;
        var pillowMax = aims[i].gain * 6;
        var reservedMax = aims[i].gain * (1.5);
        //Todo: get from data fields
        resultData.push(row);
        for (var j = 1; j < aims[i].totalMonths; j++) {
            var row = resultData[j - 1];
            if (aimExtra != 0) {
                aims[i].gain += aimExtra;
                aimExtra = 0
            }
            row.data.setMonth(row.data.getMonth() + 1);
            row.broker += aims[i].gain * percentCorrelation.brokerPerc;
            row.pillow += aims[i].gain * percentCorrelation.pillowPerc;
            row.reserved += aims[i].gain * percentCorrelation.reservedPerc;


            if (row.pillow > pillowMax) {
                percentCorrelation.pillowPerc = 0;
                RecalculatePerc();
                var remainder = row.pillow - pillowMax;
                row.pillow = pillowMax;
                row = AddRemainder(remainder, row)
            }
            if (row.reserved > reservedMax) {
                percentCorrelation.reservedPerc = 0;
                RecalculatePerc()
                var remainder = row.reserved - reservedMax;
                row.reserved = reservedMax;
                row = AddRemainder(remainder, row)
            }

            row.totalMoney += aims[i].gain;
            if (row.totalMoney !== (row.broker + row.pillow + row.reserved)) {
                throw Error("Бюджет не сошёлся!")
            }

            //Todo: make recalculate for different aims
            if (aim[i].dream > row.totalMoney) {
                aimExtra = aim[i].dream > row.totalMoney
            }
            resultData.push(row)
        }
    }
    return resultData;
}

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
            var periodsInYear = 12;
            var result = Rate(this.current.diffMonths, (-1) * this.current.gain, (-1) * this.current.rightNow, this.current.dream, 0) * periodsInYear * 100


            if (result < 0) {
                result = "Цель выполнится накоплением без вкладов."
            }
            if (result > 50) {
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

function Rate(periods, payment, present, future, type, guess) {
    guess = (guess === undefined) ? 0.01 : guess;
    future = (future === undefined) ? 0 : future;
    type = (type === undefined) ? 0 : type;

    // Set maximum epsilon for end of iteration
    var epsMax = 1e-10;

    // Set maximum number of iterations
    var iterMax = 10;

    // Implement Newton's method
    var y, y0, y1, x0, x1 = 0,
        f = 0,
        i = 0;
    var rate = guess;
    if (Math.abs(rate) < epsMax) {
        y = present * (1 + periods * rate) + payment * (1 + rate * type) * periods + future;
    } else {
        f = Math.exp(periods * Math.log(1 + rate));
        y = present * f + payment * (1 / rate + type) * (f - 1) + future;
    }
    y0 = present + payment * periods + future;
    y1 = present * f + payment * (1 / rate + type) * (f - 1) + future;
    i = x0 = 0;
    x1 = rate;
    while ((Math.abs(y0 - y1) > epsMax) && (i < iterMax)) {
        rate = (y1 * x0 - y0 * x1) / (y1 - y0);
        x0 = x1;
        x1 = rate;
        if (Math.abs(rate) < epsMax) {
            y = present * (1 + periods * rate) + payment * (1 + rate * type) * periods + future;
        } else {
            f = Math.exp(periods * Math.log(1 + rate));
            y = present * f + payment * (1 / rate + type) * (f - 1) + future;
        }
        y0 = y1;
        y1 = y;
        ++i;
    }
    return rate;
}