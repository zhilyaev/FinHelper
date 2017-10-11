"use strict";
/****************************


 <GLOBAL FUNCTIONS>

 ****************************/
/* Str[] to goal[] */
Object.getPrototypeOf(localStorage).asArrayOfObj = function () {
    let res = [];
    for (let i = 0; i < this.length-10; i++) {
        try {
            res.push(JSON.parse(this[i]))
        } catch (e) {
            console.error("Error index in localStorage:");
            console.error(e)
        }
    }
    return res
};
/* Remove like ListArray */
Object.getPrototypeOf(localStorage).safeRemove = function (index) {
    for (let i = index; i < this.length-10; i++)
        this[i] = this[i + 1]
    //
    delete this[this.length - 11]
};
function fixPercent(a,b,c) {
    if(a==="") a=0; // ParseInt(a)
    let sum = a+b+c;
    if(sum>100) a = 100 - (b + c);
    console.log("FixPercent : "+a);
    return a
}
// СТАВКА
function rate(paymentsPerYear, paymentAmount, presentValue, futureValue, dueEndOrBeginning, interest) {
    interest = (interest === undefined) ? 0.01 : interest;
    futureValue = (futureValue === undefined) ? 0. : futureValue;
    dueEndOrBeginning = (dueEndOrBeginning === undefined) ? 0 : dueEndOrBeginning;

    const FINANCIAL_MAX_ITERATIONS = 128;//Bet accuracy with 128
    const FINANCIAL_PRECISION = 0.0000001;//1.0e-8

    let y, y0, y1, x0, x1, f = 0, i;
    let rate = interest;
    if (Math.abs(rate) < FINANCIAL_PRECISION)
    {
        y = presentValue * (1 + paymentsPerYear * rate) + paymentAmount * (1 + rate * dueEndOrBeginning) * paymentsPerYear + futureValue;
    }
    else
    {
        f = Math.exp(paymentsPerYear * Math.log(1 + rate));
        y = presentValue * f + paymentAmount * (1 / rate + dueEndOrBeginning) * (f - 1) + futureValue;
    }
    y0 = presentValue + paymentAmount * paymentsPerYear + futureValue;
    y1 = presentValue * f + paymentAmount * (1 / rate + dueEndOrBeginning) * (f - 1) + futureValue;

    // find root by Newton secant method
    i = x0 = 0.0;
    x1 = rate;
    while ((Math.abs(y0 - y1) > FINANCIAL_PRECISION)
    && (i < FINANCIAL_MAX_ITERATIONS))
    {
        rate = (y1 * x0 - y0 * x1) / (y1 - y0);
        x0 = x1;
        x1 = rate;

        if (Math.abs(rate) < FINANCIAL_PRECISION)
        {
            y = presentValue * (1 + paymentsPerYear * rate) + paymentAmount * (1 + rate * dueEndOrBeginning) * paymentsPerYear + futureValue;
        }
        else
        {
            f = Math.exp(paymentsPerYear * Math.log(1 + rate));
            y = presentValue * f + paymentAmount * (1 / rate + dueEndOrBeginning) * (f - 1) + futureValue;
        }

        y0 = y1;
        y1 = y;
        ++i;
    }
    return rate
}
/****************************


 GLOBAL VARIABLES

 ****************************/
// defaults structure for goal
const defaults = {
    cy: '₽',
    name: 'Цель',
    dateStart: new Date().yyyymmdd("-"),
    // (today + 1 year).parse("YYYY-mm-dd")
    dateFinish: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).yyyymmdd("-"),
    diffMonths: 12,
    dream: "", // totalMoney
};
// Primary start
const primaryStart = localStorage.length === 0;
if (primaryStart){
    localStorage[0] = JSON.stringify(defaults);
    localStorage.i = 0;
    localStorage.brokerBag = "";
    localStorage.pillowBag = "";
    localStorage.reserveBag = "";
    localStorage.inCom = "";
    localStorage.expense = "";
    localStorage.brokerPercent = 70;
    localStorage.pillowPercent = 20;
    localStorage.reservePercent = 10;
    localStorage.risk = 12
}
// Fix deep event for app=>delTab()
let canDel = false;
// Global Application
const app = new Vue({
    el: "#app",
    data: {
        current: JSON.parse(localStorage[0]),
        // Really shit is Magic Link
        goals: localStorage,
        // current index
        i:              parseInt(localStorage.i),
        brokerBag:      parseInt(localStorage.brokerBag),
        pillowBag:      parseInt(localStorage.pillowBag),
        reserveBag:     parseInt(localStorage.reserveBag),
        inCom:          parseInt(localStorage.inCom),
        expense:        parseInt(localStorage.expense),
        brokerPercent:  parseInt(localStorage.brokerPercent),
        pillowPercent:  parseInt(localStorage.pillowPercent),
        reservePercent: parseInt(localStorage.reservePercent),
        risk:           parseInt(localStorage.risk),
        // calculated attr`s
        broker: 0,
        pillow: 0,
        reserve: 0,
        gain: 0
    },
    computed: {
        /* Should you make a new property in $data? */
        resultPercent: function () {
            return 0;
        },
        calcTable: function (){
            return [];
        }
    },
    watch: {
        // react saving in localStorage
        current: {
            handler: function () {
                this.goals[this.i] = JSON.stringify(this.current)
            },
            deep: true
        },
        // Fix Percent
        brokerPercent: function(){
            this.brokerPercent = fixPercent(this.brokerPercent,this.reservePercent,this.pillowPercent);
            localStorage.brokerPercent = this.brokerPercent
        },
        pillowPercent: function(){
            this.pillowPercent = fixPercent(this.pillowPercent,this.reservePercent,this.brokerPercent);
            localStorage.pillowPercent = this.pillowPercent
        },
        reservePercent: function() {
            this.reservePercent = fixPercent(this.reservePercent,this.pillowPercent,this.brokerPercent);
            localStorage.reservePercent = this.reservePercent
        },
        // Один 2 3 4 8 Костыли писать не бросим!
        inCom: function () {
            localStorage.inCom = this.inCom;
        },
        expense: function () {
            localStorage.expense = this.expense;
        },
        risk: function () {
            if(this.risk>30) this.risk = 30;
            localStorage.risk = this.risk;
        },
        brokerBag: function () {
            localStorage.brokerBag = this.brokerBag;
        },
        pillowBag: function () {
            localStorage.pillowBag = this.pillowBag;
        },
        reserveBag: function () {
            localStorage.reserveBag = this.reserveBag;
        },
        i: function () {
            localStorage.i = this.i;
        },

    },
    methods: {
        newTab: function () {
            this.current = JSON.parse(JSON.stringify(defaults));
            this.goals[this.goals.length-10] = JSON.stringify(this.current);
            this.i = this.goals.length-11
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
    app.i = this.value
});