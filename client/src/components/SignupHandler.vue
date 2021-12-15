<template>
	<div>
		<div
			v-ripple
			class="d-flex align-center custom--actionable"
			@click="showSignUpDialog"
		>
			<v-icon class="mr-1"> mdi-account-plus </v-icon>
			Registrarme
		</div>
		<v-dialog
			max-width="600px"
			v-model="showDialog"
		>
			<template v-slot:default>
				<v-card>
					<v-card-title class="custom--title-2 primary--text"> Registro </v-card-title>
					<v-card-text>
						<div class="d-flex align-center">
							<label class="custom--signup-label flex-shrink-0"> Email: </label>
							<v-text-field
								dense
								type="email"
								v-model="credentials.email"
							/>
						</div>
						<div class="d-flex align-center">
							<label class="custom--signup-label flex-shrink-0"> Contraseña: </label>
							<v-text-field
								dense
								type="password"
								v-model="credentials.password"
							/>
						</div>
						<div class="d-flex align-center">
							<label class="custom--signup-label flex-shrink-0"> Confirmar contraseña: </label>
							<v-text-field
								dense
								type="password"
								v-model="credentials.passwordConfirmation"
							/>
						</div>
						<v-alert
							dense
							outlined
							dismissible
							type="warning"
							v-model="message.show"
						>
							{{ message.text }}
						</v-alert>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn
							color="primary"
							text
							@click="closeSignUpDialog()"
						>
							Cancelar
						</v-btn>
						<v-btn
							color="primary"
							:disabled="signupDisabled"
							@click="closeSignUpDialog(true)"
						>
							Registrarme
						</v-btn>
					</v-card-actions>
				</v-card>
			</template>
		</v-dialog>
	</div>
</template>

<script>
	import requester from '@/helpers/requester'
	export default {
		name: 'SignupHandler',
		data: () => ({
			showDialog: false,
			credentials: {
				email: '',
				password: '',
				passwordConfirmation: ''
			},
			message: {
				show: false,
				text: ''
			}
		}),
		computed: {
			signupDisabled() {
				let { email, password, passwordConfirmation } = this.credentials
				return !(email && password && passwordConfirmation)
			}
		},
		methods: {
			showSignUpDialog() {
				this.showDialog = true
				this.message = { show: false, text: '' }
				this.credentials = { email: '', password: '', passwordConfirmation: '' }
			},
			async closeSignUpDialog(doSignup) {
				if ( doSignup ) {
					let { message, credentials: { email, password, passwordConfirmation } } = this
					message.show = false
					email = email.trim()
					if ( !/^.+@.+\..+$/.test(email) ) {
						message.show = true
						message.text = 'Se requiere una dirección de correo válida'
					} else if ( password!==passwordConfirmation ) {
						message.show = true
						message.text = 'Las contaseña no coincide con su confirmación'
					} else {
						const requestBody = { email, password }
						const response = await requester.post('/user', requestBody)
						switch ( response && response.status ) {
							case 204:
								this.showDialog = false
								this.$showErrorDialog({
									title: 'Registro',
									message: `Se envió un email a la dirección ${email} para confirmar el registro.`,
									closeText: 'Aceptar'
								})
								break
							case 409:
								message.show = true
								message.text = `La dirección ${email} ya se encuentra registrada.`
								break
							default:
								this.$showErrorDialog()
						}
					}
				} else {
					this.showDialog = false
				}
			}
		}
	}
</script>

<style scoped>
	.custom--actionable {
		cursor: pointer;
	}
	.custom--signup-label {
		width: 155px;
	}
</style>