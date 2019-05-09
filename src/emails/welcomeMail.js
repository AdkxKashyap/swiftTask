const sgMail=require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const sendWelcomeMsg=(name,email)=>{
    const msg={
        to:email,
        from:"adkx619@gmail.com",
        subject:"Welcome to SwifT@sk",
        text:`Hi ${name},Welcome to SwifT@ask`
    }

    sgMail.send(msg)
}

module.exports={
    sendWelcomeMsg
}
