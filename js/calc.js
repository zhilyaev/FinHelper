// Дефолтные настройки
const defaults = {
    goal: {
        prior:1,
        cy:'₽',
        name:'Цель',
        // (Today + 1 year).parse("YYYY-mm-dd")
        date:new Date(new Date().setFullYear(new Date().getFullYear()+1)).yyyymmdd("-"),
        dream:"",

        /* Базовые */
        inCom:"",
        expense:"",
        gain:0,
        /* / Базовые*/

        /* Проценты */
        broker:0,
        brokerPercent:70,
        pillow:0,
        pillowPercent:20,
        reserve:0,
        reservePercent:10,
        /* / Проценты */

        /* Прямо сейчас */
        rightNow:"",
        pillowRightNow:"",
        reserveRightNow:""
        /* / Прямо сейчас */
    },

    count: (localStorage.length>0) ? localStorage.length : 1
};

var app = new Vue({
    el:"#app",
    // copy obj
    data:JSON.parse(JSON.stringify(defaults)),
    computed:{
        resultPercent:function () {
            var aimTime = Date.diff(new Date(),new Date(this.goal.date))[1];
            //  TODO @Vonvee процент вклада
            // return percent [0,100]
            return 0;
        }
        // todo может стоит превратить все вычислямыые поля в computed???
    },
    methods:{
        creator: function () {
            $("header nav a.active").removeClass("active");
            this.count++;
            // todo add deleter to html
            // todo add loader to html
            var html ="<a class=\"nav-item nav-link active\" href=\"#\">" +
                "<b>"+defaults.goal.name+"</b>" +
                "#<i>"+this.count+"</i>" +
                "<button type=\"button\" class=\"close\" aria-label=\"Close\">" +
                "<span aria-hidden=\"true\">&times;</span>" +
                "</button>" +
                "</a>";
            $("header nav a:last").before(html);
            // copy obj
            this.goal=JSON.parse(JSON.stringify(defaults.goal));
            this.goal.prior = this.count;
        },
        deleter: function (key) {
            delete localStorage[key];
            this.count--;
            // todo click(this).remove
        },
        loader: function (key) {
            if(localStorage.length>0){
                // Читаем из памяти
                this.goal=JSON.parse(localStorage[key]);
                //todo click(this).set(active)
            }
        }
    }
});

var save = function () {
    // Серилизуем & Сохраняем
    localStorage[app.goal.prior]=JSON.stringify(app.goal);
    console.log("save =>"+localStorage[app.goal.prior]);
    /* todo change current item
    $("header nav a.active b").text(app.goal.name);
    $("header nav a.active i").text(app.goal.prior); */
};

