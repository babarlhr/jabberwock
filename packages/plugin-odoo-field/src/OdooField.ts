import { JWPlugin, JWPluginConfig } from '../../core/src/JWPlugin';
import { Loadables } from '../../core/src/JWEditor';
import { Parser } from '../../plugin-parser/src/Parser';
import { Renderer } from '../../plugin-renderer/src/Renderer';
import { OdooFieldDomObjectRenderer } from './OdooFieldDomObjectRenderer';
import { OdooFieldXmlDomParser } from './OdooFieldXmlDomParser';
import { ReactiveValueVersionable } from '../../utils/src/ReactiveValueVersionable';
import { OdooFieldMap } from './OdooFieldMap';
import { OdooMonetaryFieldXmlDomParser } from './OdooMonetaryFieldXmlDomParser';
import { OdooMonetaryFieldDomObjectRenderer } from './OdooMonetaryFieldDomObjectRenderer';
import { makeVersionable } from '../../core/src/Memory/Versionable';

export interface OdooFieldDefinition {
    modelId: string;
    recordId: string;
    fieldName: string;
}

export interface OdooFieldInfo extends OdooFieldDefinition {
    readonly originalValue: string;
    value: ReactiveValueVersionable<string>;
    isValid: ReactiveValueVersionable<boolean>;
}

/**
 * Regex used to validate a field.
 */
export const fieldValidators = {
    integer: /^[0-9]+$/,
    float: /^[0-9.,]+$/,
    monetary: /^[0-9.,]+$/,
};

export class OdooField<T extends JWPluginConfig = JWPluginConfig> extends JWPlugin<T> {
    readonly loadables: Loadables<Parser & Renderer> = {
        parsers: [OdooFieldXmlDomParser, OdooMonetaryFieldXmlDomParser],
        renderers: [OdooMonetaryFieldDomObjectRenderer, OdooFieldDomObjectRenderer],
    };

    private _registry: OdooFieldMap<OdooFieldInfo> = new OdooFieldMap();

    /**
     * Register an Odoo record.
     *
     * No need to get the inforation from the network if it is already present
     * in the document when parsed by the editor.
     *
     * Create two `ReactiveValue`. One that represent the actual value of the
     * `recordDefinition` and the other represent the validity of the value.
     *
     * See `get` to retrieve the values from an `OdooFieldInfo`.
     */
    register(field: OdooFieldDefinition, type: string, value: string): OdooFieldInfo {
        if (!this._registry.get(field)) {
            // TODO: Retrieve the field from Odoo through RPC.
            const reactiveValue = new ReactiveValueVersionable<string>();
            const isValid = new ReactiveValueVersionable<boolean>(true);
            if (Object.keys(fieldValidators).includes(type)) {
                reactiveValue.on('set', (newValue: string): void => {
                    isValid.set(!!newValue.match(fieldValidators[type]));
                });
            }
            reactiveValue.set(value);

            const reactiveOdooField = makeVersionable({
                ...field,
                originalValue: value,
                value: reactiveValue,
                isValid,
            });
            this._registry.set(field, reactiveOdooField);
        }
        return this._registry.get(field);
    }
    /**
     * Retrieve reactive values by providing an `OdooFieldDefinition`.
     *
     * @param field
     */
    get(field: OdooFieldDefinition): OdooFieldInfo {
        const reactiveOdooField = this._registry.get(field);
        if (!reactiveOdooField) {
            // TODO: Retrieve the field from Odoo through RPC.
            throw new Error(
                `Impossible to find the field ${field.fieldName} for model ${field.modelId} with id ${field.modelId}.`,
            );
        }
        return reactiveOdooField;
    }
}
