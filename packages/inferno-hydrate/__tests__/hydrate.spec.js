import { render } from 'inferno';
import { hydrate } from 'inferno-hydrate';
import sinon from "sinon";
import { triggerEvent } from 'inferno-utils';

describe('rendering routine', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  describe('hydrate', () => {
    it('Should be possible to hydrate manually', () => {
      // create matching DOM
      container.innerHTML = '<input type="checkbox"/>';

      let clickChecked = null;
      let changeChecked = null;

      // Hydrate manually, instead rendering
      hydrate(
        <input
          type="checkbox"
          checked={false}
          onClick={e => {
            clickChecked = e.target.checked;
          }}
          onChange={e => {
            changeChecked = e.target.checked;
          }}
        />,
        container
      );
      const input = container.firstChild;

      triggerEvent('click', input);

      expect(input.checked).toBe(false);
      expect(clickChecked).toBe(true);
      expect(changeChecked).toBe(true);
    });

    it('Should Manually hydrating should also attach root and patch when rendering next time', () => {
      // create matching DOM
      const spy = sinon.spy();
      container.innerHTML = '<div><input type="checkbox"/></div>';

      let clickChecked = null;
      let changeChecked = null;

      // Hydrate manually, instead rendering
      hydrate(
        <div ref={spy}>
          <input
            type="checkbox"
            checked={false}
            onClick={e => {
              clickChecked = e.target.checked;
            }}
            onChange={e => {
              changeChecked = e.target.checked;
            }}
          />
        </div>,
        container
      );

      const oldInput = container.firstChild.firstChild;

      expect(spy.callCount).toBe(1);

      render(
        <div ref={spy}>
          <input
            type="checkbox"
            checked={true}
            className="new-class"
            onClick={e => {
              clickChecked = e.target.checked;
            }}
            onChange={e => {
              changeChecked = e.target.checked;
            }}
          />
        </div>,
        container
      );

      expect(spy.callCount).toBe(1);

      const input = container.querySelector('input.new-class');

      expect(oldInput).toBe(input); // It should still be the same DOM node

      triggerEvent('click', input);

      expect(input.checked).toBe(true);
      expect(clickChecked).toBe(false);
      expect(changeChecked).toBe(false);

      render(null, container);

      expect(spy.callCount).toBe(2);
    });

    it('Should change value and defaultValue to empty when hydrating over existing textArea', () => {
      container.innerHTML = '<textarea>foobar</textarea>';

      hydrate(<textarea />, container);
      expect(container.firstChild.value).toBe('');
      expect(container.firstChild.defaultValue).toBe('');
    });
  });
});
