function(instance, properties) {

	var preview = Math.min(properties.bubble.height(), properties.bubble.width());
    var imgElement = document.createElement("IMG");
    imgElement.setAttribute("src", "https://meta-l.cdn.bubble.io/f1685063854450x432457913396194750/https___meta-l.cdn.bubble.io_f1685062284896x488644190346423360_b739ac93-2899-4cc1-a893-40ea8afde77e%25255B1%25255D%5B1%5D.png");
    imgElement.style.width = 0.8 * preview + "px";
    imgElement.style.verticalAlign = "middle";
    
    instance.canvas[0].appendChild(imgElement);

}