module StashEngine
  class ShareSerializer
    include SerializerMixin

    # I don't know why sharing link (a method, not a database field) would be included, but Travis is trying
    # to use it as output!
    REJECT_COLUMNS = %w[id resource_id sharing_link].freeze
    COLUMNS = (StashEngine::Share.column_names - REJECT_COLUMNS).freeze

  end
end
