import React, { useState } from 'react';
import { IMPACT_STORIES } from '../data/mockData';
import { ImpactStory } from '../types';
import { 
  Heart, 
  Calendar, 
  Users, 
  Clock, 
  Share2, 
  ArrowRight, 
  Sparkles,
  BookOpen,
  X
} from 'lucide-react';

export const ImpactStoriesPage: React.FC = () => {
  const [selectedStory, setSelectedStory] = useState<ImpactStory | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Breadcrumb & Hero Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium max-w-3xl mx-auto justify-center">
          <a href="#/home" className="hover:text-blue-600 transition">Home</a>
          <span>/</span>
          <span className="text-blue-700 font-bold">Impact Stories</span>
        </div>

        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 flex items-center gap-1.5 w-fit mx-auto">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            Community Impact
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Heartwarming Stories of Change
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Behind every logged hour is a human story. Explore how neighbors, volunteers, and organizers unite to uplift communities across the country.
          </p>
        </div>
      </div>

      {/* Featured Large Story */}
      {IMPACT_STORIES.length > 0 && (
        <div 
          onClick={() => setSelectedStory(IMPACT_STORIES[0])}
          className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg hover:shadow-xl transition cursor-pointer grid grid-cols-1 lg:grid-cols-2 group"
        >
          <div className="h-72 lg:h-auto overflow-hidden">
            <img
              src={IMPACT_STORIES[0].image}
              alt={IMPACT_STORIES[0].title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          </div>
          <div className="p-8 sm:p-12 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                {IMPACT_STORIES[0].category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 group-hover:text-brand-600 transition leading-tight">
                {IMPACT_STORIES[0].title}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {IMPACT_STORIES[0].summary}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  {IMPACT_STORIES[0].volunteersInvolved} Volunteers
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {IMPACT_STORIES[0].hoursContributed} Hours
                </span>
              </div>
              <span className="font-semibold text-brand-600 group-hover:translate-x-1 transition flex items-center gap-1">
                Read Full Story <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Other Stories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {IMPACT_STORIES.slice(1).map((story) => (
          <div
            key={story.id}
            onClick={() => setSelectedStory(story)}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col group"
          >
            <div className="h-48 overflow-hidden">
              <img
                src={story.image}
                alt={story.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                  {story.category}
                </span>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition mt-2 line-clamp-2">
                  {story.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {story.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{story.volunteersInvolved} Volunteers</span>
                <span className="font-semibold text-brand-600 flex items-center gap-1">
                  Read More <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Story Full Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-60 shrink-0">
              <img
                src={selectedStory.image}
                alt={selectedStory.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute top-4 right-4 bg-white/80 hover:bg-white text-slate-700 p-2 rounded-full shadow"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
              <span className="text-xs font-bold uppercase text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                {selectedStory.category}
              </span>
              <h2 className="text-2xl font-bold text-slate-900">{selectedStory.title}</h2>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>By {selectedStory.author}</span>
                <span>•</span>
                <span>{selectedStory.date}</span>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed pt-2">
                {selectedStory.fullStory}
              </p>

              <div className="p-4 bg-brand-50/70 border border-brand-100 rounded-2xl flex items-center justify-around text-center text-xs text-slate-700">
                <div>
                  <div className="font-bold text-base text-brand-700">{selectedStory.volunteersInvolved}</div>
                  <div className="text-[11px] text-slate-500">Volunteers Joined</div>
                </div>
                <div>
                  <div className="font-bold text-base text-brand-700">{selectedStory.hoursContributed}</div>
                  <div className="text-[11px] text-slate-500">Hours Contributed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
