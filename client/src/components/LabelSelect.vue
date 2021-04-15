<template>
	<div>

		<template v-if="onlyLabels">
			<v-chip
				v-for="(label, index) of selectionData.items"
				:key="index"
				:color="label.color"
				label
				small
				class="mr-2 mb-2"
				:class="contrastingColor(label.color, 'text')"
				@click="showLabelTree"
			>
				{{ label.name }}
			</v-chip>
			<div
				v-if="noSelection"
				class="d-flex align-center"
			>
				<span class="flex-grow-1 custom--no-data-text"> No se han asignado etiquetas. </span>
				<v-btn
					color="primary"
					dark
					class="ml-2"
					@click="showLabelTree"
				>
					Agregar
				</v-btn>
			</div>
		</template>

		<div
			v-else
			@click="showLabelTree"
		>
			<v-select
				dense
				readonly
				:multiple="multiple"
				:items="selectionData.items"
				:value="selectionData.selected"
				:clearable="clearable"
				@click:clear="clearSelection"
			>
				<template v-slot:selection="{ item }">
					<v-chip
						:color="item.color"
						label
						small
						:class="contrastingColor(item.color, 'text')"
					>
						{{ item.name }}
					</v-chip>
				</template>
			</v-select>
		</div>

		<v-dialog
			scrollable
			v-model="labelTree"
		>
			<template v-slot:default>
				<v-card>
					<v-card-title class="custom--title-3 primary--text pt-6"> Etiquetas </v-card-title>
					<v-card-text>
						<label-tree
							selectable
							:labels="labels"
							:multiple="multiple"
							:exclude="exclude"
							v-model="temporarySelected"
							@change="handleChange"
						/>
					</v-card-text>
					<v-card-actions>
						<v-spacer />
						<v-btn
							color="primary"
							text
							@click="hideLabelTree()"
						>
							Cancelar
						</v-btn>
						<v-btn
							v-if="multiple"
							color="primary"
							@click="hideLabelTree(true)"
						>
							Aceptar
						</v-btn>
					</v-card-actions>
				</v-card>
			</template>
		</v-dialog>
	</div>
</template>

<script>
	import helpers from '@/mixins/helpers'

	export default {
		name: 'LabelSelect',
		mixins: [ helpers ],
		components: {
			LabelTree: () => import('@/components/LabelTree')
		},
		props: {
			labels: Array,
			selected: {},
			multiple: { type: Boolean, default: false },
			exclude: { type: Object, default: null },
			clearable: { type: Boolean, default: false },
			onlyLabels: { type: Boolean, default: false }
		},
		model: {
			prop: 'selected',
			event: 'change'
		},
		data: () => ({
			labelTree: false,
			selected_: null,
			temporarySelected: null
		}),
		created() {
			this.setInnerSafeValue(this.selected)
		},
		watch: {
			selected(newSelected) {
				if ( newSelected!==this.selected_ ) {
					this.setInnerSafeValue(newSelected)
				}
			}
		},
		computed: {
			selectionData() {
				let data = { items: this.labels  }
				if ( this.multiple ) {
					data.items = this.selected_
					data.selected = Array.isArray(this.selected_) ? this.selected_ : []
				} else {
					data.items = this.selected_ ? [ this.selected_ ] : []
					data.selected = this.includesLabel(this.selected_, this.labels) ? this.selected_ : null
				}
				return data
			},
			noSelection() {
				return !( Array.isArray(this.selected_) ? this.selected_.length : this.selected_ ) 
			}
		},
		methods: {
			showLabelTree() {
				this.temporarySelected = this.selected_
				this.labelTree = true
			},
			hideLabelTree(saveChange) {
				if ( saveChange ) {
					this.selected_ = this.temporarySelected
					this.$emit('change', this.temporarySelected)
				}
				this.labelTree = false
			},
			setInnerSafeValue(newSelected) {
				if ( this.multiple ) {
					if ( Array.isArray(newSelected) ) {
						this.selected_ = newSelected.filter( label => this.includesLabel(label, this.labels) )
					} else {
						this.selected_ = []
					}
				} else {
					this.selected_ = this.includesLabel(newSelected, this.labels) ? newSelected : null
				}
			},
			handleChange() {
				if ( !this.multiple ) {
					this.selected_ = this.temporarySelected
					this.$emit('change', this.temporarySelected)
					this.labelTree = false
				}
			},
			clearSelection() {
				this.selected_ = []
				this.$emit('change', [])
			}
		}
	}
</script>