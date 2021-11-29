const nodemailer = require('nodemailer')

const Mailer = {

	async send(mailStructure) {
		try {
			const { subject, to, content } = mailStructure || {}
			const structure = {
				from: '"App de Registro de Sucesos" <jramirez.dev@outlook.com>',
				html: content,
				to,
				subject
			}
			const result = await internals.transporter.sendMail(structure)
			return { result }
		} catch ( error ) {
			return { error }
		}
	}

}

const internals = {

	transporter: nodemailer.createTransport({
		service: process.env.MAILING_SERVICE,
		auth: {
			user: process.env.MAILING_USER,
			pass: process.env.MAILING_PASSWORD
		}
	})

}

module.exports = Mailer
