import { OwlComponent } from '../../../plugin-owl/src/OwlComponent';
import { LinkParams } from '../Link';
import { Layout } from '../../../plugin-layout/src/Layout';
import { useState } from '@odoo/owl';

export interface LinkProps {
    replaceSelection?: boolean;
    url?: string;
    label?: string;
}

export class LinkComponent<T extends LinkProps = {}> extends OwlComponent<T> {
    static components = {};
    static template = 'link';
    state = useState({
        replaceSelection: !!this.props?.replaceSelection,
        url: this.props?.url || '',
        label: (this.state?.replaceSelection && this.props?.label) || '',
    });

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    async saveLink(): Promise<void> {
        await this.env.editor.execCommand(async context => {
            const params: LinkParams = {
                url: this.state.url,
                label: this.state.label,
            };
            await context.execCommand('link', params);
            this.env.editor.plugins.get(Layout).remove('link');
        });
        this.destroy();
    }
    async cancel(): Promise<void> {
        await this.env.editor.execCommand(async () => {
            this.env.editor.plugins.get(Layout).remove('link');
        });
        this.destroy();
    }
}
