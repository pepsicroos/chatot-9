const nodemailer = require("nodemailer");

var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "463536561bf4fb",
      pass: "38e1b6bdaa6bd1"
    }
  });

const sendEmail= async () => {
    const transporter =transport();
    const info = await  transporter.sendEmail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: "qta7a2011.rvv@gmail.com", // list of receivers
        subject: "Datos de prospecto", // Subject line
        text: "Solicitud de prospecto", // plain text body
        html: "<b>Solicitud de prospecto</b>" // html bod
    
    });
    
    


}

exports.sendEmail=()=>sendEmail()