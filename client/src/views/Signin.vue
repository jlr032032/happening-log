<template>
	<div class="custom--main-container d-flex flex-column justify-space-around">

		<div class="custom--title-section flex-shrink-0 ml-4">
			<div class="custom--rounded-rectangle primary"></div>
			<h1 class="custom--main-title white--text">
				<span class="custom--main-title-segment custom--left-short-padding"> Registro </span>
				<span class="custom--main-title-segment custom--left-large-padding"> de </span>
				<span class="custom--main-title-segment"> sucesos </span>
			</h1>
		</div>

		<div class="d-flex justify-center">
			<div class="custom--signin-section">
				<form>
					<div class="d-flex align-center">
						<label class="flex-shrink-0 custom--signin-field-label"> Email: </label>
						<v-text-field
							dense
							type="email"
							v-model="credentials.email"
						/>
					</div>
					<div class="d-flex align-center">
						<label class="flex-shrink-0 custom--signin-field-label"> Contraseña: </label>
						<v-text-field
							dense
							type="password"
							v-model="credentials.password"
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
					<v-btn
						class="primary mt-2"
						width="100%"
						dark
						@click="signIn"
					>
						Ingresar
					</v-btn>
				</form>
				<div class="d-flex justify-space-between mt-10">
					<signup-handler />
					<v-dialog max-width="600px">
						<template v-slot:activator="{ attrs, on }">
							<div
								v-bind="attrs"
								v-on="on"
							>
								<v-icon> mdi-lock-reset </v-icon>
								Recuperar acceso
							</div>
						</template>
						<template v-slot:default>
							<v-card>
								<v-card-title class="custom--title-2 primary--text"> Recuperar acceso </v-card-title>
								<v-card-text>
									<p class="mt-3"> Se enviará un email de recuperación de acceso. </p>
									<div class="d-flex align-center">
										<label class="custom--recovery-label flex-shrink-0"> Email: </label>
										<v-text-field
											dense
											type="email"
										/>
									</div>
								</v-card-text>
								<v-card-actions>
									<v-spacer />
									<v-btn
										color="primary"
										text
									>
										Cancelar
									</v-btn>
									<v-btn
										color="primary"
									>
										Enviar
									</v-btn>
								</v-card-actions>
							</v-card>
						</template>
					</v-dialog>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { mapMutations } from 'vuex'
	import requester from '@/helpers/requester'
	export default {
		name: 'Signin',
		components: {
			SignupHandler: () => import('@/components/SignupHandler')
		},
		data: () => ({
			credentials: {
				email: '',
				password: ''
			},
			message: {
				show: false,
				text: ''
			}
		}),
		methods: {
			...mapMutations(['setSignedIn']),
			showMessage(text) {
				this.message.show = true
				this.message.text = text
			},
			async signIn() {
				this.message.show = false
				const email = this.credentials.email.trim()
				const password = this.credentials.password
				if ( !email || !password ) {
					this.showMessage('Se debe proveer email y contraseña')
					return
				}
				const body = { email, password }
				const response = await requester.post('/auth/token', body)
				if ( response ) {
					switch ( response.status ) {
						case 204:
							this.setSignedIn(true)
							this.$router.push('/sucesos')
							break
						case 401:
							this.showMessage('Combinación inválida de email y contraseña')
							break
						default:
							this.$showErrorDialog()
					}
				} else {
					this.$showErrorDialog()
				}
			}
		}
	}
</script>

<style scoped>
	.custom--main-container {
		min-height: 100vh;
	}
	.custom--title-section {
		height: 275px;
	}
	.custom--rounded-rectangle {
		position: absolute;
		border-top-left-radius: 1000px;
		border-bottom-left-radius: 1000px;
		height: inherit;
		right: 0;
		width: 90%;
	}
	.custom--main-title {
		position: relative;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		letter-spacing: 0.01rem;
		font-weight: 700;
		text-transform: uppercase;
		width: 190px;
	}
	.custom--main-title-segment {
		display: block;
		position: relative; 
	}
	.custom--left-short-padding {
		left: 1em;
	}
	.custom--left-large-padding {
		left: 2em;
	}
	.custom--signin-section {
		width: 290px;
	}
	.custom--signin-field-label {
		width: 100px;
	}
	.custom--recovery-label {
		width: 50px;
	}
</style>
