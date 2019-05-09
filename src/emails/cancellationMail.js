const sgMail=require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const sendCancellationMsg=(name,email)=>{
    const msg={
        to:email,
        from:"adkx619@gmail.com",
        subject:"Sorry to See you go.",
        text:`Hi ${name},We hope to see you again`
    }

    sgMail.send(msg)
}

module.exports={
    sendCancellationMsg
}
