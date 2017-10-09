"use strict";
/****************************


 <GLOBAL FUNCTIONS>

 ****************************/
/* Str[] to goal[] */
Object.getPrototypeOf(localStorage).asArrayOfObj = function () {
    let res = [];
    for (let i = 0; i < this.length; i++) {
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
    for (let i = index; i < this.length; i++)
        this[i] = this[i + 1]
    //
    delete this[this.length - 1]
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

    /* Percent */
    broker: 0,  // calculated attr
    brokerPercent: 70,
    pillow: 0,  // calculated attr
    pillowPercent: 20,
    reserve: 0,  // calculated attr
    reservePercent: 10
};
// Primary start
const primaryStart = localStorage.length === 0;
if (primaryStart) localStorage[0] = JSON.stringify(defaults);


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
        i: 0,

        rightNow: primaryStart ? "" : parseInt(sessionStorage.rightNow),
        pillowRightNow:  primaryStart ? "" : parseInt(sessionStorage.pillowRightNow),
        reserveRightNow:  primaryStart ? "" : parseInt(sessionStorage.reserveRightNow),

        inCom:  primaryStart ? "" :parseInt(sessionStorage.inCom),
        expense:  primaryStart ? "" : parseInt(sessionStorage.expense),
        // calculated attr
        gain: 0
    },
    computed: {
        /* Should you make a new property in $data? */
        resultPercent: function () {
            let result = rate(this.current.diffMonths,  (-1) * this.current.broker, (-1)* this.rightNow, this.current.dream,0);
            result = result.toFixed(4)*100;
            console.log("rate = "+result);

            if (result < 0) return "Цель выполнится накоплением без вкладов";
            else if (result > 50) return  "Выполнение цели недостижимо в данные сроки";
            else if (isNaN(result) || this.gain<=0) return 0;
            else return result
        },
        calcTable: function (){
            const goals = this.goals.asArrayOfObj();
            let table = [];

            // Начало первой цели
            const beginnerDate = new Date(goals[0].dateStart);
            // Конец последней цели
            const finisherDate = new Date(goals[goals.length-1].dateFinish);
            // Длина всего срока инвестировния
            const totalMonths = Date.diff(beginnerDate,finisherDate)[1];

            // goals.length*goals[i].diffMonths = totalMonths
            for(let i=0;i<goals.length;i++){
                // Setup const MAX
                const reserveMax = goals[i].gain * 1.5;
                const pillowMax =  goals[i].expense * 6;


                //Бегунок по месяцам
                for(let j=0;j<goals[i].diffMonths;j++){
                    // beginnerDate++
                    beginnerDate.setMonth(beginnerDate.getMonth()+1);
                    //* @Vonvee, don`t change structure of row & don`t append or delete property
                    console.log(this.pillowRightNow+this.reserveRightNow);
                    const row = {
                        date : beginnerDate.ddmmyyyy("."),
                        totalMoney: 0,
                        broker:  this.rightNow+goals[i].broker*j,
                        pillow:  this.pillowRightNow+goals[i].pillow*j,
                        reserve: this.reserveRightNow+goals[i].reserve*j,
                        checked: function () {
                            return this.totalMoney>goals[i].dream
                        }
                    };

                    if(reserveMax<row.reserve){
                        row.pillow +=row.reserve-reserveMax;
                        row.reserve = reserveMax;
                    }
                    if(pillowMax<row.pillow){
                        row.broker +=row.pillow-pillowMax;
                        row.pillow = pillowMax;
                    }

                    row.totalMoney = this.rightNow+this.pillowRightNow+this.reserveRightNow+
                        this.broker+this.pillow+this.reserve;

                    table.push(row)
                }
            }
            return table
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
        'current.brokerPercent': function(){
            this.current.brokerPercent = fixPercent(this.current.brokerPercent,this.current.reservePercent,this.current.pillowPercent)
        },
        'current.pillowPercent': function(){
            this.current.pillowPercent = fixPercent(this.current.pillowPercent,this.current.brokerPercent,this.current.reservePercent)
        },
        'current.reservePercent': function() {
            this.current.reservePercent = fixPercent(this.current.reservePercent,this.current.brokerPercent,this.current.pillowPercent)
        },
        // 1, 2, 3, 4, 8 - Костыли писать не бросим!
        inCom: function () {
            sessionStorage.inCom = this.inCom
        },
        expense: function () {
            sessionStorage.expense = this.expense
        },
        rightNow: function () {
            sessionStorage.rightNow = this.rightNow
        },
        pillowRightNow: function () {
            sessionStorage.pillowRightNow = this.pillowRightNow
        },
        reserveRightNow: function () {
            sessionStorage.reserveRightNow = this.reserveRightNow
        }
    },
    methods: {
        newTab: function () {
            this.current = JSON.parse(JSON.stringify(defaults));
            this.goals[this.goals.length] = JSON.stringify(this.current);
            this.i = this.goals.length - 1
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