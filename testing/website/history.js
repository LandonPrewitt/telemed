function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0, and the background color of body to white */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.body.style.backgroundColor = "white";
}

var data = [];

function update()
{
	var limit = 1000;    //increase number of dataPoints by increasing this

	data.length = 0;
	var y = 0;
	var dataSeries = { type: "line" };
	var dataPoints = [];
	for (var i = 0; i < limit; i += 1) {
		y += (Math.random() * 10 - 5);
		 dataPoints.push({
		  x: i - limit / 2,
		  y: y
		   });
		}
	 dataSeries.dataPoints = dataPoints;
	 data.push(dataSeries);
}

function set_graph() {
	  
		var width = window.innerWidth;
		update();

		document.getElementById("chartContainer").style.width = width/1.8 + "px";

		var chart = new CanvasJS.Chart("chartContainer",
		{
		  zoomEnabled: true,
		  title:{
			text: "Pulse"
		  },
		  axisY:{
			includeZero: false
		  },
		  data: data,  // random generator below

	   });

		chart.render();
}

function pulse() {
	  
		var width = window.innerWidth;
		update();

		document.getElementById("chartContainer").style.width = width/1.8 + "px";
		document.getElementById("vitals-record").innerHTML = "Pulse";
		document.getElementById("vitals-title").innerHTML = "Pulse";

		var chart = new CanvasJS.Chart("chartContainer",
		{
		  zoomEnabled: true,
		  title:{
			text: "Pulse"
		  },
		  axisY:{
			includeZero: false
		  },
		  data: data,  // random generator below

	   });

		chart.render();
}

function oximeter() {
	  
		var width = window.innerWidth;
		update();

		document.getElementById("chartContainer").style.width = width/1.8 + "px";
		document.getElementById("vitals-record").innerHTML = "Oximeter";
		document.getElementById("vitals-title").innerHTML = "Oximeter";

		var chart = new CanvasJS.Chart("chartContainer",
		{
		  zoomEnabled: true,
		  title:{
			text: "Oximeter"
		  },
		  axisY:{
			includeZero: false
		  },
		  data: data,  // random generator below

	   });

		chart.render();
}

function blood_pressure() {
	  
		var width = window.innerWidth;
		update();

		document.getElementById("chartContainer").style.width = width/1.8 + "px";
		document.getElementById("vitals-record").innerHTML = "Blood Pressure";
		document.getElementById("vitals-title").innerHTML = "Blood Pressure";

		var chart = new CanvasJS.Chart("chartContainer",
		{
		  zoomEnabled: true,
		  title:{
			text: "Blood Presssure"
		  },
		  axisY:{
			includeZero: false
		  },
		  data: data,  // random generator below

	   });

		chart.render();
}

function temperature() {
	  
		var width = window.innerWidth;
		update();

		document.getElementById("chartContainer").style.width = width/1.8 + "px";
		document.getElementById("vitals-record").innerHTML = "Temperature";
		document.getElementById("vitals-title").innerHTML = "Temperature";

		var chart = new CanvasJS.Chart("chartContainer",
		{
		  zoomEnabled: true,
		  title:{
			text: "Temperature"
		  },
		  axisY:{
			includeZero: false
		  },
		  data: data,  // random generator below

	   });

		chart.render();
}

function height() {
	  
		var width = window.innerWidth;
		update();

		document.getElementById("chartContainer").style.width = width/1.8 + "px";
		document.getElementById("vitals-record").innerHTML = "Height";
		document.getElementById("vitals-title").innerHTML = "Height";

		var chart = new CanvasJS.Chart("chartContainer",
		{
		  zoomEnabled: true,
		  title:{
			text: "Height"
		  },
		  axisY:{
			includeZero: false
		  },
		  data: data,  // random generator below

	   });

		chart.render();
}

function weight() {
	  
		var width = window.innerWidth;
		update();

		document.getElementById("chartContainer").style.width = width/1.8 + "px";
		document.getElementById("vitals-record").innerHTML = "Weight";
		document.getElementById("vitals-title").innerHTML = "Weight";

		var chart = new CanvasJS.Chart("chartContainer",
		{
		  zoomEnabled: true,
		  title:{
			text: "Weight"
		  },
		  axisY:{
			includeZero: false
		  },
		  data: data,  // random generator below

	   });

		chart.render();
}

function throat_ears() {
	  
		var width = window.innerWidth;
		update();

		document.getElementById("chartContainer").style.width = width/1.8 + "px";
		document.getElementById("vitals-record").innerHTML = "Throat/Ears";
		document.getElementById("vitals-title").innerHTML = "Throat/Ears";

		var chart = new CanvasJS.Chart("chartContainer",
		{
		  zoomEnabled: true,
		  title:{
			text: "Throat/Ears"
		  },
		  axisY:{
			includeZero: false
		  },
		  data: data,  // random generator below

	   });

		chart.render();
}


