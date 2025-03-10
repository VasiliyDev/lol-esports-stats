<template>
  <div
      class="base-select"
      :class="{ opened: open }"
      @focusout="handleFocusOut($event)"
      tabindex="0"
  >
    <div class="base-select__title d-flex ac" @click="open = !open">
      <template v-if="selectedItem">
        <img v-if="selectedItem.img" :src="selectedItem.img" />
        <span>{{ selectedItem.name }}</span>
      </template>
      <span v-else class="base-select__placeholder">
        {{ placeholder }}
      </span>
    </div>
    <div class="base-select__dropdown" v-if="open">
      <div class="base-select__list">
        <div
            class="base-select__list-item d-flex ac"
            v-for="option in optionList"
            :key="option.value"
            @click.stop="selectOption(option.value)"
        >
          <img v-if="option.img" :src="option.img" />
          <span v-html="option.name"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "AppSelect",
  props: {
    selected: String,
    optionList: Array,
    placeholder: String,
  },
  data() {
    return {
      open: false,
    };
  },
  model: {
    prop: "selected",
    event: "select",
  },
  computed: {
    selectedItem: function () {
      if (this.selected && this.optionList.length > 0) {
        return this.optionList.find((el) => el.value === this.selected);
      }
      return null;
    },
  },
  methods: {
    handleFocusOut(evt) {
      if (!evt.currentTarget.contains(evt.relatedTarget)) this.open = false;
    },
    selectOption: function (value) {
      console.log('emittt',value);
      this.$emit("select", value);
      this.open = false;
    },
  },
};
</script>

<style scoped lang="scss">
.base-select {
  user-select: none;
  position: relative;
  width: 100%;
  height: 40px;
  font-size: 14px;
  font-family: sfpro, sans-serif;
  font-weight: 400;

  &__title {
    position: relative;
    padding: 0 25px 0 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
    border-bottom: 1px solid #484a5a;
    transition: .15s ease-in-out;

    &:hover {
      border-color: #ccc;
    }
    img {
      margin-right: 10px;
    }
    svg {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      width: 10px;
      fill: #fff;
    }
  }

  &__placeholder {
    color: #eee;
  }
  &.opened {
    .base-select__title {
      border-color: #ccc;
    }
    .base-select__title svg {
      transform: translateY(-50%) rotate(180deg);
    }
  }
  &__dropdown {
    min-width: 200px;
    top: 100%;
    margin-top: 10px;
    left: 0;
    position: absolute;
    width: 100%;
    background: #ccc;
    z-index: 2;
    border-radius: 8px;
  }
  &__list {
    overflow-y: auto;
    max-height: 300px;
    &-item {
      img {
        margin-right: 10px;
      }
      cursor: pointer;
      line-height: 1.2;
      padding: 10px 15px;
      transition: .15s ease-in-out;;
      &:hover {
        background:#ddd;
      }
    }
  }
}
</style>
