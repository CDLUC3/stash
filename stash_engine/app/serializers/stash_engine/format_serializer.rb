module StashEngine
  class FormatSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id].freeze
    COLUMNS = (StashDatacite::Format.column_names - REJECT_COLUMNS).freeze

  end
end
