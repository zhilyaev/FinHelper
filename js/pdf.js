function genPDF() {
    html2canvas($("#tablePDF"), {
        onrendered: function(canvas) {
            var img = canvas.toDataURL('image/png');
            var doc = new jsPDF('landscape');
            doc.addImage(img,'JPEG',50,20);
            doc.save("YourPlan.pdf");
        }
    });
}