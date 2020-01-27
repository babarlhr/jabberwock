import { JWPlugin, JWPluginConfig } from '../core/src/JWPlugin';
import { SuperscriptDomParser } from './SuperscriptDomParser';
import { Inline } from '../plugin-inline/Inline';

export class Superscript<T extends JWPluginConfig> extends JWPlugin<T> {
    static dependencies = [Inline];
    readonly parsers = [SuperscriptDomParser];
}