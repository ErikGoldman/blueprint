/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the terms of the LICENSE file distributed with this project.
 */

import classNames from "classnames";
import * as React from "react";

import { HTMLInputProps, IInputGroupProps, InputGroup, IOverlayProps, Overlay, Utils } from "@blueprintjs/core";

import { Classes, IListItemsProps } from "../../common";
import { IQueryListRendererProps, QueryList } from "../query-list/queryList";

export interface IOmnibarProps<T> extends IListItemsProps<T> {
    /**
     * Props to spread to `InputGroup`. All props are supported except `ref` (use `inputRef` instead).
     * If you want to control the filter input, you can pass `value` and `onChange` here
     * to override `Select`'s own behavior.
     */
    inputProps?: IInputGroupProps & HTMLInputProps;

    /**
     * Toggles the visibility of the omnibar.
     * This prop is required because the component is controlled.
     */
    isOpen: boolean;

    /**
     * A callback that is invoked when user interaction causes the omnibar to
     * close, such as clicking on the overlay or pressing the `esc` key (if
     * enabled). Receives the event from the user's interaction, if there was an
     * event (generally either a mouse or key event).
     *
     * Note that due to controlled usage, this component will not actually close
     * itself until the `isOpen` prop becomes `false`.
     * .
     */
    onClose?: (event?: React.SyntheticEvent<HTMLElement>) => void;

    /** Props to spread to `Overlay`. */
    overlayProps?: Partial<IOverlayProps>;
}

export class Omnibar<T> extends React.PureComponent<IOmnibarProps<T>> {
    public static displayName = "Blueprint2.Omnibar";

    public static ofType<T>() {
        return Omnibar as new (props: IOmnibarProps<T>) => Omnibar<T>;
    }

    private TypedQueryList = QueryList.ofType<T>();
    private queryList?: QueryList<T> | null;
    private refHandlers = {
        queryList: (ref: QueryList<T> | null) => (this.queryList = ref),
    };

    public render() {
        // omit props specific to this component, spread the rest.
        const { initialContent = null, isOpen, inputProps, overlayProps, ...restProps } = this.props;

        return (
            <this.TypedQueryList
                {...restProps}
                initialContent={initialContent}
                onItemSelect={this.props.onItemSelect}
                ref={this.refHandlers.queryList}
                renderer={this.renderQueryList}
            />
        );
    }

    private renderQueryList = (listProps: IQueryListRendererProps<T>) => {
        const { inputProps = {}, isOpen, overlayProps = {} } = this.props;
        const { handleKeyDown, handleKeyUp } = listProps;
        const handlers = isOpen && listProps.query.length > 0 ? { onKeyDown: handleKeyDown, onKeyUp: handleKeyUp } : {};

        return (
            <Overlay
                hasBackdrop={true}
                {...overlayProps}
                isOpen={isOpen}
                className={classNames(Classes.OMNIBAR_OVERLAY, overlayProps.className)}
                onClose={this.handleOverlayClose}
            >
                <div className={classNames(Classes.OMNIBAR, listProps.className)} {...handlers}>
                    <InputGroup
                        autoFocus={true}
                        large={true}
                        leftIcon="search"
                        placeholder="Search..."
                        {...inputProps}
                        onChange={listProps.handleQueryChange}
                        value={listProps.query}
                    />
                    {listProps.itemList}
                </div>
            </Overlay>
        );
    };

    private handleOverlayClose = (event?: React.SyntheticEvent<HTMLElement>) => {
        const { overlayProps = {} } = this.props;
        Utils.safeInvoke(overlayProps.onClose, event);
        Utils.safeInvoke(this.props.onClose, event);
    };
}
