/*
* ES 6
* camelCase
* */

// defaults structure for goal
const defaults = {
    cy: '₽',
    name: 'Цель',
    dateStart: new Date().yyyymmdd("-"),
    // (today + 1 year).parse("YYYY-mm-dd")
    dateFinish: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).yyyymmdd("-"),
    diffMonths: 12,

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
    let res = [];
    for (let i = 0; i < this.length; i++) {
        try {
            res.push(JSON.parse(this[i]))
        } catch (e) {
            console.log("Error index in localStorage")
        }
    }

    return res
};
/* Calc table data */
Object.getPrototypeOf(localStorage).calcTable = function () {
    // this === app.goals === localStorage
    // structure of aims[i]  = structure of defaults
    const aims = this.asArrayOfObj();
    let table = [];

    for(let i=0; i<aims.length; i++){
        // Structure of row
        const row = {
            date: 0,
            totalMoney: aims[i].rightNow + aims[i].broker + aims[i].reserve, // see Example
            broker:0,
            pillow:0,
            reserve:0,
            checked: false
        };

        // TODO: @Vonvee your code here
        /* example
        * row.date = aims[i].date;
        * row.totalMoney = aims[i].rightNow + aims[i].broker + aims[i].reserve;
        * var percentsCorrelation = [ aims[i].brokerPercent, aims[i].brokerPercent, aims[i].pillowPercent ];
        */

        table.push(row)
    }

    return table
};

/* Remove like ListArray */
Object.getPrototypeOf(localStorage).safeRemove = function (index) {
    for (let i = index; i < this.length; i++) {
        this[i] = this[i + 1]
    }
    delete this[this.length - 1]
};
// Primary start
if (localStorage.length === 0) localStorage[0] = JSON.stringify(defaults);
let canDel = false;
const app = new Vue({
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
            let periodsInYear = 12;
            let result = Rate(this.current.diffMonths, (-1) * this.current.gain, (-1) * this.current.rightNow, this.current.dream, 0) * periodsInYear * 100;
            if (result < 0) {
                result = "Цель выполнится накоплением без вкладов."
            }
            if (result > 50) {
                result = "Выполнение цели недостижимо в данные сроки."
            }
            // Fix
            if (isNaN(result) || this.current.gain===0) result = 0;
            return result
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
            canDel = true
        },
        setActive: function (key) {
            // has click delTab early
            if (canDel) {
                canDel = false;
                // delTab:
                this.goals.safeRemove(key);
                // offset
                key = 0
            }
            // SetActive :
            this.current = JSON.parse(this.goals[key]);
            this.i = key

        }
    }
});

// Change place by prior
$("#prior").change(function () {
    // app.goals === localStorage
    let t = app.goals[this.value];
    app.goals[this.value] = app.goals[app.i];
    app.goals[app.i] = t;

    app.i = this.value;
});

function Rate(periods, payment, present, future, type, guess) {
    guess = (guess === undefined) ? 0.01 : guess;
    future = (future === undefined) ? 0 : future;
    type = (type === undefined) ? 0 : type;

    // Set maximum epsilon for end of iteration
    const epsMax = 1e-10;

    // Set maximum number of iterations
    const iterMax = 10;

    // Implement Newton's method
    let y, y0, y1, x0, x1 = 0,
        f = 0,
        i = 0;
    let rate = guess;
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