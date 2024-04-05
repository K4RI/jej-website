export default class Turtle {
    constructor(canvas, pas){
        this.canvas = canvas; // le canevas sur lequel on dessine
        this.context = canvas.getContext('2d');
        this.x = canvas.width / 2; // position de la tortue
        this.y = canvas.height / 2;
        this.pas = pas; // longueur d'un pas
        this.theta = 0; // angle de la tortue
        this.pen = false;
    }

    /** Replace le curseur au centre du canevas. */
    reinitXY(val) {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
        this.theta = 0;
    }

    /** Trace une ligne de (x1, y1) vers (x2, y2). */
    line(x1, y1, x2, y2) {
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        if (this.pen) {
            this.context.stroke()
        };
    }

    /** Avance la tortue d'une distance r. */
    forward(r) {
        // Nouvelle position
        let xn = this.x + this.pas*r*Math.cos(this.theta*Math.PI/180);
        let yn = this.y + this.pas*r*Math.sin(this.theta*Math.PI/180);
        // On trace la ligne
        this.line(this.x, this.y, xn, yn);
        // On met à jour les coordonnées
        this.x = xn;
        this.y = yn;
    }

    /** Tourne la tortue à gauche d'un angle th. */
    left(th) {
        this.theta = (this.theta - th)%360
    }

    /** Tourne la tortue à droite d'un angle th. */
    right(th) {
        this.theta = (this.theta + th)%360
    }

    /** Change vers une couleur c. */
    color(c) {
        this.context.strokeStyle = c;
    }

    /** Active le pinceau. */
    pendown() {
        this.pen = true;
    }

    /** Désactive le pinceau. */
    penup() {
        this.pen = 0;
    }
};