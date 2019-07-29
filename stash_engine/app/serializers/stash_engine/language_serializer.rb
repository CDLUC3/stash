module StashEngine
  class LanguageSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id resource_id].freeze
    COLUMNS = (StashDatacite::Language.column_names - REJECT_COLUMNS).freeze

  end
end
