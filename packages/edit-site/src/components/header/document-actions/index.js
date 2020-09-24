/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	__experimentalGetBlockLabel as getBlockLabel,
	getBlockType,
} from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import { last } from 'lodash';

function getBlockDisplayText( block ) {
	return block
		? getBlockLabel( getBlockType( block.name ), block.attributes )
		: null;
}

function useSecondaryText() {
	const {
		selectedBlock,
		getBlockParentsByBlockName,
		getBlockWithoutInnerBlocks,
		hoveredBlockIds,
		getBlockName,
		getBlock,
	} = useSelect( ( select ) => {
		const {
			getSelectedBlock,
			getHoveredBlocks,
			getBlockParentsByBlockName: _getBlockParentsByBlockName,
			__unstableGetBlockWithoutInnerBlocks,
			getBlockName: _getBlockName,
			getBlock: _getBlock,
		} = select( 'core/block-editor' );
		return {
			selectedBlock: getSelectedBlock(),
			getBlockParentsByBlockName: _getBlockParentsByBlockName,
			getBlockWithoutInnerBlocks: __unstableGetBlockWithoutInnerBlocks,
			hoveredBlockIds: getHoveredBlocks(),
			getBlockName: _getBlockName,
			getBlock: _getBlock,
		};
	} );

	// Check if current block is a template part:
	let selectedBlockLabel =
		selectedBlock?.name === 'core/template-part'
			? getBlockDisplayText( selectedBlock )
			: null;

	// Check if an ancestor of the current block is a template part:
	if ( ! selectedBlockLabel ) {
		const templatePartParents = !! selectedBlock
			? getBlockParentsByBlockName(
					selectedBlock?.clientId,
					'core/template-part'
			  )
			: [];

		if ( templatePartParents.length ) {
			// templatePartParents is in order from top to bottom, so the closest
			// parent is at the end.
			const closestParent = getBlockWithoutInnerBlocks(
				last( templatePartParents )
			);
			selectedBlockLabel = getBlockDisplayText( closestParent );
		}
	}

	// Go through hovered blocks and see if one is of interest.
	const hoveredTemplatePartBlockId = hoveredBlockIds.find(
		( blockId ) => getBlockName( blockId ) === 'core/template-part'
	);

	if ( hoveredTemplatePartBlockId ) {
		const hoveredBlockLabel = getBlockDisplayText(
			getBlock( hoveredTemplatePartBlockId )
		);
		return {
			label: hoveredBlockLabel,
			isActive: hoveredBlockLabel === selectedBlockLabel,
		};
	}

	if ( selectedBlockLabel ) {
		return {
			label: selectedBlockLabel,
			isActive: true,
		};
	}

	return {};
}

export default function DocumentActions( { documentTitle } ) {
	const { label, isActive } = useSecondaryText();
	// Title is active when there is no secondary item, or when the secondary
	// item is inactive.
	const isTitleActive = ! label?.length || ! isActive;
	return (
		<div
			className={ classnames( 'edit-site-document-actions', {
				'has-secondary-label': !! label,
			} ) }
		>
			{ documentTitle ? (
				<>
					<div
						className={ classnames(
							'edit-site-document-actions__label',
							'edit-site-document-actions__title',
							{
								'is-active': isTitleActive,
							}
						) }
					>
						{ documentTitle }
					</div>
					<div
						className={ classnames(
							'edit-site-document-actions__label',
							'edit-site-document-actions__secondary-item',
							{
								'is-active': isActive,
							}
						) }
					>
						{ label ?? '' }
					</div>
				</>
			) : (
				__( 'Loading…' )
			) }
		</div>
	);
}