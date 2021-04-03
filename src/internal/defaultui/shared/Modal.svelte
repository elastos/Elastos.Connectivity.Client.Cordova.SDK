<!-- v0.9.0 -->

<script context="module">
  export function bind(Component, props = {}) {
    return function ModalComponent(options) {
      return new Component({
        ...options,
        props: {
          ...props,
          ...options.props
        }
      });
    };
  }
  export function close() {
    close();
  }
</script>

<script lang="ts">
  import * as svelte from 'svelte';
  import { fade } from 'svelte/transition';
  import { createEventDispatcher } from "svelte";
  import type { ModalCallbacks } from './modalcallbacks';
  import { globalThemeService } from '../../../services/global.theme.service';

  const dispatch = createEventDispatcher();

  const baseSetContext = svelte.setContext;

  export let show = null;

  export let key = 'simple-modal';
  export let closeButton = true;
  export let closeOnEsc = true;
  export let closeOnOuterClick = true;
  export let styleBg = { top: 0, left: 0 };
  export let styleWindowWrap = {};
  export let styleWindow = {};
  export let styleContent = {};
  export let styleCloseButton = {};
  export let setContext = baseSetContext;
  export let transitionBg = fade;
  export let transitionBgProps = { duration: 250 };
  export let transitionWindow = transitionBg;
  export let transitionWindowProps = transitionBgProps;

  const defaultState = {
    closeButton,
    closeOnEsc,
    closeOnOuterClick,
    styleBg,
    styleWindowWrap,
    styleWindow,
    styleContent,
    styleCloseButton,
    transitionBg,
    transitionBgProps,
    transitionWindow,
    transitionWindowProps,
  };
  let state = { ...defaultState };

  let Component = null;

  let background;
  let wrap;
  let modalWindow;

  const camelCaseToDash = str => str
    .replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();

  const toCssString = (props) => Object.keys(props)
    .reduce((str, key) => `${str}; ${camelCaseToDash(key)}: ${props[key]}`, '');

  const isFunction = f => !!(f && f.constructor && f.call && f.apply);

  $: cssBg = toCssString(state.styleBg);
  $: cssWindowWrap = toCssString(state.styleWindowWrap);
  $: cssWindow = toCssString(state.styleWindow);
  $: cssContent = toCssString(state.styleContent);
  $: cssCloseButton = toCssString(state.styleCloseButton);
  $: currentTransitionBg = state.transitionBg;
  $: currentTransitionWindow = state.transitionWindow;

  const toVoid = () => {};
  let onOpen = toVoid;
  let onClose = toVoid;
  let onOpened = toVoid;
  let onClosed = toVoid;

  let callback: ModalCallbacks = {};

  export const setCallback = (_callback: ModalCallbacks) => {
    callback = _callback;
  }

  export const open = (
    NewComponent,
    newProps = {},
    options = {}
  ) => {
    Component = bind(NewComponent, newProps);
    state = { ...defaultState, ...options };
    onOpen = () => {
      if (callback.onOpen) callback.onOpen();
      dispatch('opening');
    },
    onClose = () => {
      if (callback.onClose) callback.onClose();
      dispatch('closing');
    },
    onOpened = () => {
      if (callback.onOpened) callback.onOpened();
      dispatch('opened');
    };
    onClosed = () => {
      if (callback.onClosed) callback.onClosed();
      dispatch('closed');
    };
  };

  export const close = (callback: ModalCallbacks = {}) => {
    onClose = callback.onClose || onClose;
    onClosed = callback.onClosed || onClosed;
    Component = null;
  };

  const handleKeydown = (event) => {
    if (state.closeOnEsc && Component && event.key === 'Escape') {
      event.preventDefault();
      close();
    }

    if (Component && event.key === 'Tab') {
      // trap focus
      /* BPI DISABLED TO BUILD IN TS const nodes = modalWindow.querySelectorAll('*');
      const tabbable = Array.from(nodes).filter(node => node.tabIndex >= 0);

      let index = tabbable.indexOf(document.activeElement);
      if (index === -1 && event.shiftKey) index = 0;

      index += tabbable.length + (event.shiftKey ? -1 : 1);
      index %= tabbable.length;

      tabbable[index].focus();
      event.preventDefault();*/
    }
  };

  const handleOuterClick = (event) => {
    if (
      state.closeOnOuterClick && (
        event.target === background || event.target === wrap
      )
    ) {
      event.preventDefault();
      close();
    }
  };

  setContext(key, { open, close });

  $: {
    if (isFunction(show)) {
      open(show);
    } else {
      close();
    }
  }
</script>

<style>
  * {
    box-sizing: border-box;
  }

  .bg {
    position: fixed;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.66);
  }

  .window-wrap {
    position: relative;
    margin: 2rem;
    max-height: 100%;
  }

  .window {
    position: relative;
    width: 40rem;
    max-width: 100%;
    max-height: 100%;
    margin: 2rem auto;
    color: black;
    border-radius: 0.5rem;
    background: white;
  }

  .content {
    position: relative;
    padding: 1rem;
    max-height: calc(100vh - 4rem);
    overflow: auto;
  }

  .close {
    display: block;
    box-sizing: border-box;
    position: absolute;
    z-index: 1000;
    top: 1rem;
    right: 1rem;
    margin: 0;
    padding: 0;
    width: 1.5rem;
    height: 1.5rem;
    border: 0;
    border-radius: 1.5rem;
    transition: transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1), background 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
		color: white;
		background: linear-gradient(to bottom, #732dcf, #640fd4);
		border: 2px solid linear-gradient(to bottom, #732dcf, #640fd4);
  }

  .close:before, .close:after {
    content: '';
    display: block;
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    width: 1rem;
    height: 1px;
    background: white;
    transform-origin: center;
    transition: height 0.2s cubic-bezier(0.25, 0.1, 0.25, 1), background 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  }

  .close:before {
    -webkit-transform: translate(0, -50%) rotate(45deg);
    -moz-transform: translate(0, -50%) rotate(45deg);
    transform: translate(0, -50%) rotate(45deg);
    left: 0.25rem;
  }

  .close:after {
    -webkit-transform: translate(0, -50%) rotate(-45deg);
    -moz-transform: translate(0, -50%) rotate(-45deg);
    transform: translate(0, -50%) rotate(-45deg);
    left: 0.25rem;
  }

  .close:active {
    transform: scale(0.9);
  }

  .close:hover, .close:focus, .close:active {
    outline: none;
  }

  .dark-mode {
    background: #191a2f;
    color: #ffffff;
  }
</style>

<svelte:window on:keydown={handleKeydown}/>

{#if Component}
  <div
    class="bg"
    on:click={handleOuterClick}
    bind:this={background}
    transition:currentTransitionBg={state.transitionBgProps}
    style={cssBg}
  >
    <div class="window-wrap" bind:this={wrap} style={cssWindowWrap}>
      <div
        class="window"
        role="dialog"
        aria-modal="true"
        bind:this={modalWindow}
        transition:currentTransitionWindow={state.transitionWindowProps}
        on:introstart={onOpen}
        on:outrostart={onClose}
        on:introend={onOpened}
        on:outroend={onClosed}
        style={cssWindow}
        class:dark-mode={globalThemeService.darkMode}
      >
        {#if state.closeButton}
          {#if isFunction(state.closeButton)}
            <svelte:component this={state.closeButton} onClose={close} />
          {:else}
            <button on:click={close} class="close" style={cssCloseButton} />
          {/if}
        {/if}
        <div class="content" style={cssContent}>
          <svelte:component this={Component} />
        </div>
      </div>
    </div>
  </div>
{/if}
<slot></slot>
