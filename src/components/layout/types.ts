import type { Component } from 'vue';

export type NavItem = {
    label: string;
    to: string;
    icon: Component;
    match: string[];
};
