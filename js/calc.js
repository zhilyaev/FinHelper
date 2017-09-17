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
    data:$.extend({}, defaults),
    computed:{
        resultPercent:function () {
            var aimTime = Date.diff(new Date(),new Date(this.goal.date))[1];
            //  TODO @Vonvee algoritm
            // return percent [0,100]
            return 0;
        }
    },
    methods:{
        creator: function () {
            $("header nav a.active").removeClass("active");
            this.count++;
            var html ="<a class=\"nav-item nav-link active\" href=\"#\">\n" +
                "\t\t\t\t<span>#"+this.count+"</span>\n" +
                "\t\t\t\t<button type=\"button\" class=\"close\" aria-label=\"Close\">\n" +
                "\t\t\t\t\t<span aria-hidden=\"true\">&times;</span>\n" +
                "\t\t\t\t</button>\n" +
                "\t\t\t</a>";
            $("header nav a:last").before(html);
            // TODO Clear
            app.goal=$.extend({}, defaults.goal);
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
                app.goal=JSON.parse(localStorage[key]);
            }
        }
    }
});

var save = function () {
    // Серилизуем & Сохраняем
    localStorage[app.goal.prior]=JSON.stringify(app.goal);
    console.log("save =>"+localStorage[app.goal.prior]);
};
