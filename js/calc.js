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
    broker: 0,
    brokerPercent: 70,
    pillow: 0,
    pillowPercent: 20,
    reserve: 0,
    reservePercent: 10
};
// Primary start
if (localStorage.length === 0){
    localStorage[0] = JSON.stringify(defaults);
    // That works and okay
    sessionStorage["inCom"] = "";
    sessionStorage["expense"] = "";
    sessionStorage["rightNow"] = "";
    sessionStorage["pillowRightNow"]="";
    sessionStorage["reserveRightNow"]="";
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
        i: 0,

        /* rightNow */
        rightNow: sessionStorage["rightNow"],
        pillowRightNow: sessionStorage["pillowRightNow"],
        reserveRightNow: sessionStorage["reserveRightNow"],

        inCom: sessionStorage["inCom"],
        expense: sessionStorage["expense"],
        gain: 0
    },
    computed: {
        /* Should you make a new property in $data? */
        resultPercent: function () {
            const periodsInYear = 12;
            let result = rate(periodsInYear,  (-1) * this.current.broker, (-1)* this.rightNow, this.current.dream,0.01);
            console.log("rate = "+result);

            if (result < 0) return "Цель выполнится накоплением без вкладов";
            else if (result > 50) return  "Выполнение цели недостижимо в данные сроки";
            else if (isNaN(result) || this.gain<=0) return 0;
            else return result.toFixed(4)*this.current.diffMonths
        },
        calcTable: function (){
            const goals = this.goals.asArrayOfObj();
            let table = [];

            // Начало первой цели
            const beginnerDate = new Date(goals[0].dateStart);
            // Конец последней цели
            const finisherDate = new Date(goals[goals.length-1].dateFinish);
            // Длина всего срока
            const totalMoths = Date.diff(beginnerDate,finisherDate)[1];
            //console.log('Весь срок: '+totalMoths+' months');
            // Переключатель целей
            let index = 0;
            // сука, это пенка!
            let foam = 0;

            for(let i=0;i<totalMoths+1;i++){
                // Setup const
                //* @Vonvee, don`t change structure of row
                // * don`t append or delete property
                const row = {
                    date : new Date(new Date().setMonth(beginnerDate.getMonth()+i)),// Можно прибавлять к beginnerDate++
                    totalMoney: this.rightNow+this.pillowRightNow+this.reserveRightNow,
                    broker: this.rightNow+goals[index].broker,
                    pillow: this.pillowRightNow+goals[index].pillow,
                    reserve:this.reserveRightNow+goals[index].reserve,
                    checked: true
                };

                table.push(row)
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
        // crutches
        inCom: function () {
            sessionStorage["inCom"] = this.inCom
        },
        expense: function () {
            sessionStorage["expense"] = this.expense
        },
        rightNow: function () {
            sessionStorage["rightNow"] = this.rightNow
        },
        pillowRightNow: function () {
            sessionStorage["pillowRightNow"] = this.pillowRightNow
        },
        reserveRightNow: function () {
            sessionStorage["reserveRightNow"] = this.reserveRightNow
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