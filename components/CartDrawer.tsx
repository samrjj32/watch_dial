'use client';

import { useEffect, useRef, useState } from 'react';
import WatchPreview from './WatchPreview';
import BackplatePreview from './BackplatePreview';
import { buildProperties, hasEngraving, money, priceBuild, type Build } from '@/lib/catalog';

export interface CartItem {
  id: string;
  build: Build;
  quantity: number;
  unitPrice: number;
}

interface Props {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onChangeQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartDrawer({ open, items, onClose, onChangeQuantity, onRemove }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  useEffect(() => {
    if (!open) setCheckingOut(false);
  }, [open]);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <dialog className="cart-dialog" ref={dialog} onClose={onClose} aria-label="Your cart">
      <div className="cart-header">
        <div>
          <p className="eyebrow">JELLYLAB WATCHES</p>
          <h2>
            Your <span>cart</span>
          </h2>
        </div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close cart">
          ×
        </button>
      </div>

      <div className="cart-content">
        {checkingOut ? (
          <div className="checkout-summary">
            <h3>This is a prototype checkout</h3>
            <p>
              Your build is complete and priced, but this port has no payment backend. On the live
              store this step hands the configured line item — variant, build code and every option
              below — to Shopify.
            </p>
            <div className="checkout-order">
              {items.map((item) => (
                <div key={item.id}>
                  <span>
                    Custom Casio Royale × {item.quantity}
                    <br />
                    <small className="cart-build-code">{item.id}</small>
                  </span>
                  <span>{money(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
              <div className="checkout-total">
                <span>Total</span>
                <span>{money(subtotal)}</span>
              </div>
            </div>
            <button type="button" className="outline-button" onClick={() => setCheckingOut(false)}>
              Back to cart
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-cart">
            <h3>Your cart is empty</h3>
            <p>Design a Royale and add it here to see the full build summary.</p>
            <button type="button" className="outline-button" onClick={onClose}>
              Back to the builder
            </button>
          </div>
        ) : (
          items.map((item) => {
            const properties = buildProperties(item.build);
            const engraved = hasEngraving(item.build.engraving);
            return (
              <article className="cart-item" key={item.id}>
                <div className="cart-item-main">
                  <div className="cart-previews">
                    <span className="cart-thumbnail">
                      <WatchPreview build={item.build} label="" />
                    </span>
                    {engraved && (
                      <span className="cart-backplate">
                        <BackplatePreview engraving={item.build.engraving} label="" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="cart-item-heading">
                      <h3>
                        Custom Casio Royale
                        <br />
                        <span className="cart-build-code">{item.id}</span>
                      </h3>
                      <strong>{money(item.unitPrice * item.quantity)}</strong>
                    </div>
                    <dl className="cart-item-details">
                      {Object.entries(properties)
                        .filter(([, value]) => value && value !== 'None')
                        .map(([label, value]) => (
                          <div key={label} style={{ display: 'contents' }}>
                            <dt>{label}</dt>
                            <dd>{value}</dd>
                          </div>
                        ))}
                    </dl>
                    <div className="cart-item-actions">
                      <div className="quantity-control">
                        <button
                          type="button"
                          onClick={() => onChangeQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onChangeQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button type="button" className="text-button remove-item" onClick={() => onRemove(item.id)}>
                        Remove
                      </button>
                    </div>
                    <p className="cart-upgrades">
                      {priceBuild(item.build).upgrades.map((upgrade) => upgrade.name).join(' · ') ||
                        'No paid upgrades'}
                    </p>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {items.length > 0 && !checkingOut && (
        <div className="cart-footer">
          <div className="cart-subtotal">
            <span>Subtotal</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <p className="cart-tax-note">Taxes and shipping calculated at checkout.</p>
          <button
            type="button"
            className="primary-button checkout-button"
            onClick={() => setCheckingOut(true)}
          >
            <span>Checkout</span>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M5 12h14m-5-5 5 5-5 5" />
            </svg>
          </button>
          <p className="demo-note">Prototype · no payment is taken</p>
        </div>
      )}
    </dialog>
  );
}
