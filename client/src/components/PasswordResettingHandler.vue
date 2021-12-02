<template>
	<div>
		<div
			v-ripple
			class="d-flex align-center custom--actionable"
			@click="showPasswordResettingDialog"
		>
			<v-icon class="mr-1"> mdi-lock-reset </v-icon>
			Reiniciar contraseña
		</div>
		<v-dialog
			max-width="600px"
			v-model="showDialog"
		>
			<template v-slot:default>
				<v-card>
					<v-card-title class="custom--title-2 primary--text"> Contraseña </v-card-title>
					<v-card-text>
						<p class="mt-3"> Se enviará un email para recuperar la contraseña. </p>
						<div class="d-flex align-center">
							<label class="custom--label flex-shrink-0"> Email: </label>
							<v-text-field
								dense
								type="email"
								v-model="email"
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
						<v-spacer />
						<v-btn
							color="primary"
							text
							@click="hidePasswordResettingDialog()"
						>
							Cancelar
						</v-btn>
						<v-btn
							color="primary"
							@click="hidePasswordResettingDialog(true)"
						>
							Enviar
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
		name: 'PasswordResettingHandler',
		data: () => ({
			showDialog: null,
			email: '',
			message: {
				show: null,
				text: null
			}
		}),
		methods: {
			showPasswordResettingDialog() {
				this.showDialog = true
				this.message.show = false
				this.email = ''
			},
			async hidePasswordResettingDialog(sendEmail) {
				this.message.show = false
				if ( sendEmail ) {
					const email = this.email.trim()
					if ( !/^.+@.+\..+$/.test(email) ) {
						this.message.text = 'Se debe proveer un email válido'
						this.message.show = true
						return
					}
					const response = await requester.post('user/password-resetting', { email })
					switch ( response && response.status ) {
						case 200:
							this.showDialog = false
							this.$showErrorDialog({
								title: 'Contraseña',
								message: `Se envió un correo con la nueva contraseña a ${email}`
							})
							break
						case 422:
							this.message.text = 'No hay ninguna cuenta asociada al correo provisto'
							this.message.show = true
							break
						default:
							this.$showErrorDialog()
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
	.custom--label {
		width: 50px;
	}
</style>
