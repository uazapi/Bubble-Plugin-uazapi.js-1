function(instance, properties) {

	var preview = Math.min(properties.bubble.height(), properties.bubble.width());
    var imgElement = document.createElement("IMG");
    imgElement.setAttribute("src", "https://meta-l.cdn.bubble.io/f1687877424297x152106290190667800/uazap%20i%20%2815%29round.png");
    imgElement.style.width = 0.8 * preview + "px";
    imgElement.style.verticalAlign = "middle";
    
    instance.canvas[0].appendChild(imgElement);

}