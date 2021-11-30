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
					/>
				</div>
				<div class="d-flex align-center">
					<label class="custom--password-label flex-shrink-0"> Contraseña nueva: </label>
					<v-text-field
						dense
						type="password"
					/>
				</div>
				<div class="d-flex align-center">
					<label class="custom--password-label flex-shrink-0"> Confirmar contraseña: </label>
					<v-text-field
						dense
						type="password"
					/>
				</div>
				<div class="d-flex justify-end mt-3">
					<v-btn
						color="primary"
						class="custom--button"
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