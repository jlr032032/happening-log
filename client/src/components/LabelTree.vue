<template>
	<div>
		<div
			v-for="(label, index) in labels"
			:key="index"
		>
			<template v-if="!isExcluded(label)">

				<v-sheet
					v-if="isLeaf(label)"
					rounded
					class="pa-2 mb-2 d-flex align-center custom--label-element"
					:color="label.color"
					elevation="2"
				>
					<span
						class="flex-grow-1 custom--leaf-text"
						:class="contrastingColor(label.color, 'text')"
					>
						{{ label.name }}
					</span>
					<div>
						<div
							v-if="selectable"
							class="custom--action-section d-flex align-center justify-center"
						>
							<v-checkbox
								class="custom--checkbox"
								:dark="contrastingColor(label.color, 'darkTheme')"
								:color="contrastingColor(label.color)"
								:input-value="isSelected(label)"
								@change="handleSelection(label, $event)"
							/>
						</div>
						<v-btn
							v-else
							fab
							elevation="0"
							x-small
							class="flex-shrink-0"
							:class="contrastingColor(label.color, 'text')"
							:color="label.color"
							@click="$emit('click:details', label)"
						>
							<v-icon> mdi-dots-vertical </v-icon>
						</v-btn>
					</div>
				</v-sheet>

				<template v-else>
					<v-sheet
						rounded
						class="pa-2 mb-2 d-flex align-center custom--label-element"
						elevation="2"
						:color="label.color"
					>
						<div
							class="custom--icon-button flex-shrink-0 d-flex justify-center align-center"
							@click="toggleExpansion(label)"
						>
							<v-icon
								:class="expandIconDynamicStyles(label)"
							>
								mdi-menu-right
							</v-icon>
						</div>
						<span
							class="flex-grow-1 custom--actionable"
							:class="contrastingColor(label.color, 'text')"
							@click="toggleExpansion(label)"
						>
							{{ label.name }}
						</span>
						<div>
							<div
								v-if="selectable"
								class="custom--action-section d-flex align-center justify-center"
							>
								<v-checkbox
									class="custom--checkbox"
									:dark="contrastingColor(label.color, 'darkTheme')"
									:color="contrastingColor(label.color)"
									:input-value="isSelected(label)"
									@change="handleSelection(label, $event)"
								/>
							</div>
							<v-btn
								v-else
								fab
								elevation="0"
								x-small
								class="flex-shrink-0"
								:class="contrastingColor(label.color, 'text')"
								:color="label.color"
								@click="$emit('click:details', label)"
							>
								<v-icon> mdi-dots-vertical </v-icon>
							</v-btn>
						</div>
					</v-sheet>
					<v-expand-transition>
						<label-tree
							v-show="isExpanded(label)"
							class="custom--nested"
							:labels="label.subLabels"
							:parentLabel="label"
							:exclude="exclude"
							v-model="selected_"
							:selectable="selectable"
							:multiple="multiple"
							:deepLevel_="true"
							@change="$emit('change', $event)"
							@click:details="$emit('click:details', $event)"
						/>
					</v-expand-transition>
				</template>

			</template>
		</div>
	</div>
</template>

<script>
	import helpers from '@/mixins/helpers'

	export default {
		name: 'LabelTree',
		mixins: [ helpers ],
		components: {
			LabelTree: () => import('@/components/LabelTree')
		},
		props: {
			labels: Array,
			selected: {},
			parentLabel: { type: Object, default: null },
			selectable: { type: Boolean, default: false },
			multiple: { type: Boolean, default: false },
			exclude: { type: Object, default: null },
			deepLevel_: { type: Boolean, default: false }
		},
		model: {
			prop: 'selected',
			event: 'change'
		},
		data: () => ({
			expanded: [],
			selected_: undefined
		}),
		created() {
			this.setInnerSafeValue(this.selected)
		},
		watch: {
			labels(newLabels, oldLabels) {
				if ( oldLabels!==newLabels ) {
					this.expanded = []
					this.selected_ = []
				}
			},
			selected(newSelected) {
				if ( newSelected!==this.selected_ ) {
					this.setInnerSafeValue(newSelected)
				}
			}
		},
		methods: {
			isLeaf(label) {
				return !label.subLabels
			},
			isSelected(label) {
				const selected = this.selected_
				return this.multiple ? Array.isArray(selected) && selected.includes(label) : selected === label
			},
			isExcluded(label) {
				return label === this.exclude
			},
			isExpanded(label) {
				return this.expanded.includes(label)
			},
			toggleExpansion(label) {
				const index = this.expanded.indexOf(label)
				if ( index>-1 ) {
					this.expanded.splice(index, 1)
				} else {
					this.expanded.push(label)
				}
			},
			expandIconDynamicStyles(label) {
				return {
					'custom--rotated-arrow': this.isExpanded(label),
					[this.contrastingColor(label.color, 'text')]: true
				}
			},
			setInnerSafeValue(newSelected) {
				if ( this.deepLevel_ ) {
					this.selected_ = newSelected
				} else {
					if ( this.multiple ) {
						if ( Array.isArray(newSelected) ) {
							this.selected_ = newSelected.filter( label => this.includesLabel(label, this.labels) )
						} else {
							this.selected_ = []
						}
					} else {
						this.selected_ = this.includesLabel(newSelected, this.labels) ? newSelected : null
					}
				}
			},
			handleSelection(label, trueValue) {
				if ( this.multiple ) {
					if ( trueValue ) {
						this.selected_ = [ ...this.selected_, label ]
					} else {
						const index = this.selected_.indexOf(label)
						this.selected_ = this.selected_
							.slice(0, index)
							.concat( this.selected_.slice(index+1) )
					}
				} else {
					this.selected_ = trueValue ? label : null
				}
				this.$emit('change', this.selected_)
			}
		}
	}
</script>

<style scoped>
	.custom--rotated-arrow {
		transform: rotate(90deg);
	}
	.custom--icon-button {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		cursor: pointer;
	}
	.custom--actionable {
		cursor: pointer;
	}
	.custom--label-element {
		width: 100%;
	}
	.custom--nested {
		margin-left: 30px;
	}
	.custom--leaf-text {
		margin-left: 32px;
		cursor: default;
	}
	.custom--action-section {
		width: 32px;
		height: 32px;
	}
</style>