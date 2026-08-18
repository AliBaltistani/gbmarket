import React from 'react';
import SEO from '../components/SEO';
import { useSettings } from '../context/SettingsContext';

export default function PrivacyPolicy() {
    const { settings } = useSettings();
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 pb-16">
            <SEO
                title="Privacy Policy"
                description={`Our privacy policy outlining how we handle and protect your personal information at ${settings.store_name || 'our store'}.`}
                canonical={`${window.location.origin}/privacy`}
            />

            <section className="bg-gradient-to-r from-[#F5EFE0] via-[#F5A623]/20 to-[#F5EFE0] border-b border-[#E8DEC8] py-12 px-4 text-center rounded-3xl mt-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#3A2E1F]">Privacy Policy</h1>
                <p className="text-sm text-[#3A2E1F]/70 mt-2">Last updated: August 2026</p>
            </section>

            <div
                className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-8 sm:p-12 space-y-6 shadow-sm text-sm text-[#3A2E1F]/80 leading-relaxed font-body"
                dangerouslySetInnerHTML={{ __html: settings.privacy_policy_content || '<p>No privacy policy configured yet.</p>' }}
            />
        </div>
    );
}
