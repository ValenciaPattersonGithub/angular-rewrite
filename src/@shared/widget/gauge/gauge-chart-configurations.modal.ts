export class GaugeChartConfigurations {
    showLabels?: boolean = false;
    rangeSize?: number = 13; // Range (1 to 30) 
    rangeLineCap?: string = "round"; //Options =["round", "butt"];
    rangePlaceholderColor?: string = "rgba(228, 228, 228, 1)";
    startAngle?: number = 0;  // Range min="-90" to max="90"  
    endAngle?: number = 180;  // Range min="90" to max="270"
    value?: number = 0;       // Range min="0" to max="100"
    Reverse?: boolean = false;
    colors?: [{ from?: number, to?: number, color?: string, opacity?: number }] = [{ from: 0, to: 100, color: "#75c2de", opacity: 1 }]
}

