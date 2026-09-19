import { Hammer, Globe, Shield, Palette } from 'lucide-react';
import { VALUE_PROPOSITIONS } from '../../../data/lumoraData';
import './ValueProps.css';

const ICON_MAP = {
  Hammer: Hammer,
  Globe: Globe,
  Shield: Shield,
  Palette: Palette,
};

export function ValueProps() {
  return (
    <section className="section value-props" aria-label="Giá trị cốt lõi của LUMORA">
      <div className="container">
        <div className="value-props__grid">
          {VALUE_PROPOSITIONS.map((item) => {
            const IconComponent = ICON_MAP[item.icon] || Shield;
            return (
              <div key={item.id} className="value-card">
                <div className="value-card__icon-box">
                  <IconComponent size={24} className="value-card__icon" />
                </div>
                <h3 className="value-card__title">{item.title}</h3>
                <p className="value-card__desc">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ValueProps;
