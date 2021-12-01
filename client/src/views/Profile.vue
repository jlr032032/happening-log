<template>
	<div class="d-flex justify-center">
		<div class="mt-12 mx-9 custom--main-container">
			<h1 class="custom--title-1 primary--text"> Datos de usuario </h1>

			<form class="mt-6">
				<div class="d-flex align-center">
					<label class="custom--email-label flex-shrink-0"> Email: </label>
					<v-text-field
						dense
						type="email"
						v-model="user.newEmail"
					/>
				</div>
				<div class="d-flex justify-end">
					<v-btn
						color="primary"
						class="custom--button"
						@click="updateEmail"
					>
						Actualizar email
					</v-btn>
				</div>
			</form>

			<form class="mt-6">
				<div class="d-flex align-center">
					<label class="custom--password-label flex-shrink-0"> Contraseña actual: </label>
					<v-text-field
						dense
						type="password"
						v-model="user.password"
					/>
				</div>
				<div class="d-flex align-center">
					<label class="custom--password-label flex-shrink-0"> Contraseña nueva: </label>
					<v-text-field
						dense
						type="password"
						v-model="user.newPassword"
					/>
				</div>
				<div class="d-flex align-center">
					<label class="custom--password-label flex-shrink-0"> Confirmar contraseña: </label>
					<v-text-field
						dense
						type="password"
						v-model="user.passwordConfirmation"
					/>
				</div>
				<div class="d-flex justify-end mt-3">
					<v-btn
						color="primary"
						class="custom--button"
						@click="updatePassword"
					>
						Actualizar contraseña
					</v-btn>
				</div>
			</form>

			<v-dialog>
				<template v-slot:activator="{ attrs, on }">
					<v-btn
						width="100%"
						black
						dark
						class="mt-12"
						v-bind="attrs"
						v-on="on"
					>
						Eliminar cuenta
					</v-btn>
				</template>
				<template v-slot:default>
					<v-card>
						<v-card-title> Eliminar cuenta </v-card-title>
						<v-card-text> La cuenta y toda la información registrada será eliminada ¿Deseas eliminarla definitivamente? </v-card-text>
						<v-card-actions>
							<v-spacer />
							<v-btn text> Cancelar </v-btn>
							<v-btn black dark> Eliminar </v-btn>
						</v-card-actions>
					</v-card>
				</template>
			</v-dialog>
			
			<v-alert
				:type="message.type"
				dismissible
				class="custom--message"
				transition="scale-transition"
				v-model="message.show"
			>
				{{ message.text }}
			</v-alert>

		</div>
	</div>
</template>

<script>
	import requester from '@/helpers/requester'
	export default {
		name: 'Profile',
		data: () => ({
			user: {
				email: null,
				newEmail: null,
				password: null,
				newPassword: null,
				passwordConfirmation: null
			},
			message: {
				show: null,
				text: null,
				type: null
			}
		}),
		async created() {
			const response = await requester.get('/user')
			if ( response && response.status===200 ) {
				const { user } = this
				user.email = user.newEmail = response.data.email
			} else {
				this.$showErrorDialog({ message: 'No se pudo obtener el email en este momento.' })
			}
		},
		methods: {
			async updateEmail() {
				let { user, user: { newEmail } } = this
				this.message.show = false
				newEmail = newEmail.trim()
				if ( !/^.+@.+\..+$/.test(newEmail) ) {
					this.message.text = 'La dirección de email no es válida'
					this.message.type = 'warning'
					this.message.show = true
					return
				}
				const response = await requester.put('/user/email', { email: newEmail })
				if ( response && response.status===200 ) {
					const message = this.message
					message.text = 'Email actualizado exitosamente'
					message.type = 'success'
					message.show = true
					setTimeout(() => message.show = false, 4000)
				} else {
					user.newEmail = user.email
					this.$showErrorDialog()
				}
			},
			async updatePassword() {
				let { message } = this
				const { password, newPassword, passwordConfirmation: confirmation } = this.user
				message.show = false
				if ( password && newPassword && confirmation ) {
					if ( newPassword===confirmation ) {
						const response = await requester.put('/user/password', { password, newPassword })
						switch ( response && response.status ) {
							case 200:
								message.text = 'La contraseña fue actualizada exitosamente'
								message.type = 'success'
								message.show = true
								setTimeout(() => message.show = false, 4000)
								break
							case 401:
								message.text = 'Contraseña actual incorrecta'
								message.type = 'error'
								message.show = true
								break
							default:
								this.$showErrorDialog()
						}
					} else {
						message.text = 'La contraseña nueva debe coincidir con su confirmación'
						message.type = 'warning'
						message.show = true
					}
				} else {
					let { message } = this
					message.text = 'Se debe proveer la contraseña actual, la nueva contraseña y su confirmación'
					message.type = 'warning'
					message.show = true
				}
			}
		}
	}
</script>

<style scoped>
	.custom--main-container {
		max-width: 500px;
	}
	.custom--button {
		width: 235px;
	}
	.custom--email-label {
		width: 55px;
	}
	.custom--password-label {
		width: 150px;
	}
	.custom--message {
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		width: 297px;
	}
</style>
